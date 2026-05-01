use aes_gcm::{Aes256Gcm, KeyInit, Nonce};
use aes_gcm::aead::{Aead, OsRng};
use hkdf::Hkdf;
use rand::RngCore;
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

use argon2::{Argon2, password_hash::SaltString};

#[derive(Debug)]
pub enum VaultError {
    Crypto,
    InvalidInput,
}

const VERSION: u8 = 1;
const NONCE_LEN: usize = 12;
const MASTER_KEY_LEN: usize = 32;

pub fn encrypt_payload(
    password: &str,
    payload: &[u8],
    context: &[u8],
) -> Result<Vec<u8>, VaultError> {
    if payload.is_empty() {
        return Err(VaultError::InvalidInput);
    }

    let salt = SaltString::generate(&mut OsRng);
    let mut master_key = [0u8; MASTER_KEY_LEN];

    Argon2::default()
        .hash_password_into(
            password.as_bytes(),
            salt.as_bytes(),
            &mut master_key,
        )
        .map_err(|_| VaultError::Crypto)?;

    let hk = Hkdf::<Sha256>::new(Some(context), &master_key);
    let mut enc_key = [0u8; 32];

    hk.expand(b"vault-encryption-key", &mut enc_key)
        .map_err(|_| VaultError::Crypto)?;

    let mut nonce_bytes = [0u8; NONCE_LEN];
    OsRng.fill_bytes(&mut nonce_bytes);

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| VaultError::Crypto)?
        .as_secs();

    for (i, b) in nonce_bytes.iter_mut().enumerate() {
        *b ^= (now >> (i % 8)) as u8;
    }

    let nonce = Nonce::from_slice(&nonce_bytes);

    let cipher = Aes256Gcm::new_from_slice(&enc_key)
        .map_err(|_| VaultError::Crypto)?;

    let ciphertext = cipher
        .encrypt(nonce, aes_gcm::aead::Payload {
            msg: payload,
            aad: context,
        })
        .map_err(|_| VaultError::Crypto)?;

    let mut out = Vec::with_capacity(1 + 1 + salt.as_bytes().len() + NONCE_LEN + ciphertext.len());

    out.push(VERSION);
    out.push(salt.as_bytes().len() as u8);
    out.extend_from_slice(salt.as_bytes());
    out.extend_from_slice(&nonce_bytes);
    out.extend_from_slice(&ciphertext);

    Ok(out)
}
