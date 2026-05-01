use chrono::{DateTime, Datelike, Duration, NaiveDate, Utc};
use serde::Deserialize;
use std::collections::HashMap;
use std::fs::{File, read_dir};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};

#[derive(Debug)]
pub enum ReportError {
    Io(std::io::Error),
    Parse(serde_json::Error),
    InvalidDate,
}

impl From<std::io::Error> for ReportError {
    fn from(e: std::io::Error) -> Self {
        ReportError::Io(e)
    }
}

impl From<serde_json::Error> for ReportError {
    fn from(e: serde_json::Error) -> Self {
        ReportError::Parse(e)
    }
}

#[derive(Debug, Deserialize)]
struct LogEntry {
    timestamp: DateTime<Utc>,
    level: String,
    message: String,
    context: Option<serde_json::Value>,
}

pub fn generate_weekly_report(
    log_dir: &Path,
    week_start: &str,
    output_path: &Path,
) -> Result<(), ReportError> {
    let start_date =
        NaiveDate::parse_from_str(week_start, "%Y-%m-%d").map_err(|_| ReportError::InvalidDate)?;

    if start_date.weekday().num_days_from_monday() != 0 {
        return Err(ReportError::InvalidDate);
    }

    let end_date = start_date + Duration::days(6);

    // Aggregation
    let mut total_entries = 0usize;
    let mut level_counts: HashMap<String, usize> = HashMap::new();
    let mut daily_counts: HashMap<NaiveDate, usize> = HashMap::new();

    // Iterate over files in directory
    for entry in read_dir(log_dir)? {
        let entry = entry?;
        let path = entry.path();

        if !is_log_file(&path) {
            continue;
        }

        // Extract date from filename
        let file_date = match extract_date(&path) {
            Some(d) => d,
            None => continue,
        };

        if file_date < start_date || file_date > end_date {
            continue;
        }

        // Read file line by line
        let file = File::open(&path)?;
        let reader = BufReader::new(file);

        for line in reader.lines() {
            let line = line?;

            if line.trim().is_empty() {
                continue;
            }

            let parsed: LogEntry = serde_json::from_str(&line)?;

            total_entries += 1;

            *level_counts.entry(parsed.level).or_insert(0) += 1;
            *daily_counts.entry(file_date).or_insert(0) += 1;
        }
    }

    // --- Write report ---
    let mut out = File::create(output_path)?;

    writeln!(out, "Weekly Log Report")?;
    writeln!(out, "===================")?;
    writeln!(out, "Week: {} to {}", start_date, end_date)?;
    writeln!(out)?;

    writeln!(out, "Total Entries: {}", total_entries)?;
    writeln!(out)?;

    writeln!(out, "Entries by Level:")?;
    for (level, count) in level_counts.iter() {
        writeln!(out, "  {:<10} {}", level, count)?;
    }

    writeln!(out)?;
    writeln!(out, "Entries by Day:")?;

    for i in 0..7 {
        let d = start_date + Duration::days(i);
        let count = daily_counts.get(&d).copied().unwrap_or(0);
        writeln!(out, "  {}: {}", d, count)?;
    }

    Ok(())
}

fn is_log_file(path: &Path) -> bool {
    path.extension()
        .and_then(|s| s.to_str())
        .map(|ext| ext == "log")
        .unwrap_or(false)
}

fn extract_date(path: &Path) -> Option<NaiveDate> {
    let stem = path.file_stem()?.to_str()?;
    NaiveDate::parse_from_str(stem, "%Y-%m-%d").ok()
}
