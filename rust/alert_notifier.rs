use chrono::{DateTime, Utc, Duration};
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;
use std::collections::HashMap;

use crate::hypervisor_guard::Alert;

const RATE_LIMIT_SECS: i64 = 120;

pub struct Notifier {
    smtp: SmtpTransport,
    from: String,
    last_sent: HashMap<String, DateTime<Utc>>,
}

impl Notifier {
    pub fn new(smtp_server: &str, username: &str, password: &str, from: &str) -> Self {
        let creds = Credentials::new(username.to_string(), password.to_string());

        let smtp = SmtpTransport::relay(smtp_server)
            .unwrap()
            .credentials(creds)
            .build();

        Self {
            smtp,
            from: from.to_string(),
            last_sent: HashMap::new(),
        }
    }

    pub fn send_alert(
        &mut self,
        alert: &Alert,
        recipient: &str,
        now: DateTime<Utc>,
    ) -> Result<(), String> {
        if let Some(last) = self.last_sent.get(&alert.account_id) {
            if *last + Duration::seconds(RATE_LIMIT_SECS) > now {
                return Ok(());
            }
        }

        let subject = format!(
            "[SECURITY] Suspicious activity detected (score {:.2})",
            alert.score
        );

        let body = format!(
            "Account: {}\nScore: {:.3}\nReason: {}\nTimestamp: {}\n",
            alert.account_id,
            alert.score,
            alert.reason,
            now.to_rfc3339()
        );

        let email = Message::builder()
            .from(self.from.parse().map_err(|_| "invalid from")?)
            .to(recipient.parse().map_err(|_| "invalid recipient")?)
            .subject(subject)
            .body(body)
            .map_err(|_| "failed to build email")?;

        self.smtp
            .send(&email)
            .map_err(|_| "failed to send email")?;

        self.last_sent.insert(alert.account_id.clone(), now);
        Ok(())
    }
}
