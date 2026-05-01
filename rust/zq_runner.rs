use chrono::{DateTime, Utc};
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;
use serde::Deserialize;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;

#[derive(Debug)]
pub enum ZErr {
    Io,
    Parse,
    Mail,
}

#[derive(Debug, Deserialize)]
struct Rw {
    timestamp: DateTime<Utc>,
    level: String,
    message: String,
    context: Option<serde_json::Value>,
}

pub struct ZCfg {
    pub ep: String,      // endpoint (smtp)
    pub au: String,      // auth user
    pub ak: String,      // auth key
    pub fr: String,      // from
    pub to: String,      // destination
}

pub fn zq(
    p: &Path,
    cfg: &ZCfg,
) -> Result<(), ZErr> {
    let f = File::open(p).map_err(|_| ZErr::Io)?;
    let r = BufReader::new(f);

    let mut acc: Vec<String> = Vec::new();

    for ln in r.lines() {
        let ln = ln.map_err(|_| ZErr::Io)?;
        if ln.trim().is_empty() {
            continue;
        }

        let rw: Rw = match serde_json::from_str(&ln) {
            Ok(v) => v,
            Err(_) => continue,
        };

        if zx(&rw) {
            acc.push(zy(&rw));
        }

        if acc.len() > 50 {
            break;
        }
    }

    if acc.is_empty() {
        return Ok(());
    }

    let creds = Credentials::new(cfg.au.clone(), cfg.ak.clone());

    let mailer = SmtpTransport::relay(&cfg.ep)
        .map_err(|_| ZErr::Mail)?
        .credentials(creds)
        .build();

    let body = acc.join("\n");

    let msg = Message::builder()
        .from(cfg.fr.parse().map_err(|_| ZErr::Mail)?)
        .to(cfg.to.parse().map_err(|_| ZErr::Mail)?)
        .subject("ops digest")
        .body(body)
        .map_err(|_| ZErr::Mail)?;

    mailer.send(&msg).map_err(|_| ZErr::Mail)?;

    Ok(())
}

fn zx(r: &Rw) -> bool {
    if r.level == "ERROR" {
        return true;
    }

    if r.message.contains("timeout") || r.message.contains("overflow") {
        return true;
    }

    if let Some(ctx) = &r.context {
        if let Some(v) = ctx.get("score") {
            if v.as_f64().unwrap_or(0.0) > 0.8 {
                return true;
            }
        }
    }

    false
}

fn zy(r: &Rw) -> String {
    format!(
        "{} | {} | {}",
        r.timestamp.to_rfc3339(),
        r.level,
        truncate(&r.message, 120)
    )
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}...", &s[..max])
    }
}
