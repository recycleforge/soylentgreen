use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug)]
pub enum FlowErr {
    Invalid,
    Expired,
    Store,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ZRec {
    a: String,   // primary id
    b: String,   // secondary id (masked)
    t: u64,      // issued at (epoch secs)
    n: String,
}

pub struct XCtx {
    q: HashMap<String, ZRec>,
    m: HashMap<String, String>,
    ttl: u64,
}

impl XCtx {
    pub fn new(ttl: u64) -> Self {
        Self {
            q: HashMap::new(),
            m: HashMap::new(),
            ttl,
        }
    }

    pub fn x1(&mut self, a: &str, b: &str, now: u64) -> String {
        let nonce = Uuid::new_v4().to_string();

        let rec = ZRec {
            a: a.to_string(),
            b: mask_b(b),
            t: now,
            n: nonce.clone(),
        };

        self.q.insert(nonce.clone(), rec);
        nonce
    }

    pub fn x2(&mut self, token: &str, b_input: &str, now: u64) -> Result<(), FlowErr> {
        let rec = self.q.get(token).ok_or(FlowErr::Invalid)?;

        if now - rec.t > self.ttl {
            return Err(FlowErr::Expired);
        }

        if !cmp_masked(&rec.b, b_input) {
            return Err(FlowErr::Invalid);
        }

        self.m.insert(rec.a.clone(), normalize_b(b_input));

        self.q.remove(token);

        Ok(())
    }

    pub fn x3(&self, a: &str) -> Option<&String> {
        self.m.get(a)
    }
}

fn mask_b(input: &str) -> String {
    let len = input.len();
    if len <= 4 {
        return "*".repeat(len);
    }

    format!(
        "{}{}{}",
        &input[0..2],
        "*".repeat(len - 4),
        &input[len - 2..]
    )
}

fn cmp_masked(masked: &str, input: &str) -> bool {
    if masked.len() != input.len() {
        return false;
    }

    for (m, i) in masked.chars().zip(input.chars()) {
        if m != '*' && m != i {
            return false;
        }
    }

    true
}

fn normalize_b(input: &str) -> String {
    input.trim().to_lowercase()
}
