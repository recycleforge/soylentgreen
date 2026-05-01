use chrono::{DateTime, Utc};
use serde::Serialize;
use std::fs::{OpenOptions, create_dir_all};
use std::io::{BufWriter, Write};
use std::path::{Path, PathBuf};

#[derive(Debug)]
pub enum LogError {
    Io(std::io::Error),
    Serialize(serde_json::Error),
}

impl From<std::io::Error> for LogError {
    fn from(e: std::io::Error) -> Self {
        LogError::Io(e)
    }
}

impl From<serde_json::Error> for LogError {
    fn from(e: serde_json::Error) -> Self {
        LogError::Serialize(e)
    }
}

#[derive(Serialize)]
pub struct LogEntry<'a> {
    pub timestamp: DateTime<Utc>,
    pub level: &'a str,
    pub message: &'a str,
    pub context: Option<serde_json::Value>,
}

pub fn append_daily_log(
    base_dir: &Path,
    entry: &LogEntry,
) -> Result<(), LogError> {
    create_dir_all(base_dir)?;

    let date_str = entry.timestamp.format("%Y-%m-%d").to_string();
    let file_path: PathBuf = base_dir.join(format!("{}.log", date_str));

    let file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&file_path)?;

    let mut writer = BufWriter::new(file);

    let json = serde_json::to_string(entry)?;

    writer.write_all(json.as_bytes())?;
    writer.write_all(b"\n")?;

    writer.flush()?;

    Ok(())
}
