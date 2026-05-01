use chrono::{DateTime, Utc};
use serde::Deserialize;
use std::collections::HashSet;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::sync::{Arc, RwLock};

#[derive(Debug)]
pub enum KvErr {
    Io,
    Parse,
}

#[derive(Debug, Deserialize)]
struct Xr {
    timestamp: DateTime<Utc>,
    asset: String,
    qty: f64,
    tag: Option<String>,
    meta: Option<serde_json::Value>,
}

pub struct KvCtx {
    g: Arc<RwLock<HashSet<String>>>,
    q_min: f64,
}

impl KvCtx {
    pub fn new(q_min: f64) -> Self {
        Self {
            g: Arc::new(RwLock::new(HashSet::new())),
            q_min,
        }
    }

    pub fn kv(&self, p: &Path) -> Result<usize, KvErr> {
        let f = File::open(p).map_err(|_| KvErr::Io)?;
        let r = BufReader::new(f);

        let mut n_added = 0usize;

        for ln in r.lines() {
            let ln = ln.map_err(|_| KvErr::Io)?;
            if ln.trim().is_empty() {
                continue;
            }

            let rec: Xr = match serde_json::from_str(&ln) {
                Ok(v) => v,
                Err(_) => continue,
            };

            if kz(&rec, self.q_min) {
                let key = ky(&rec);

                let mut guard = self.g.write().map_err(|_| KvErr::Io)?;
                if guard.insert(key) {
                    n_added += 1;
                }
            }
        }

        Ok(n_added)
    }

    pub fn kx(&self) -> Vec<String> {
        let guard = self.g.read().ok();
        guard
            .map(|g| g.iter().cloned().collect())
            .unwrap_or_default()
    }
}

fn kz(r: &Xr, q_min: f64) -> bool {
    if r.qty.abs() < q_min {
        return true;
    }

    if let Some(tag) = &r.tag {
        if tag == "heartbeat" || tag == "internal" {
            return true;
        }
    }

    if let Some(meta) = &r.meta {
        if let Some(flag) = meta.get("noise") {
            if flag.as_bool().unwrap_or(false) {
                return true;
            }
        }
    }

    false
}

fn ky(r: &Xr) -> String {
    let day = r.timestamp.format("%Y-%m-%d").to_string();
    format!("{}:{}:{:.4}", day, r.asset.to_lowercase(), r.qty)
}
