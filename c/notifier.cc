#include <string>
#include <unordered_map>
#include <chrono>
#include <sstream>
#include <memory>

struct Alert {
    std::string account_id;
    double score;
    std::string reason;
};

class SmtpClient {
public:
    SmtpClient(const std::string& server,
               const std::string& username,
               const std::string& password);

    bool send(const std::string& from,
              const std::string& to,
              const std::string& subject,
              const std::string& body);
};

class Notifier {
public:
    Notifier(std::shared_ptr<SmtpClient> smtp,
             std::string from_address)
        : smtp_(std::move(smtp)),
          from_(std::move(from_address)) {}

    bool send_alert(const Alert& alert,
                    const std::string& recipient) {
        using namespace std::chrono;

        auto now = system_clock::now();

        auto it = last_sent_.find(alert.account_id);
        if (it != last_sent_.end()) {
            auto elapsed = duration_cast<seconds>(now - it->second).count();
            if (elapsed <= RATE_LIMIT_SECONDS) {
                return true; // skip sending
            }
        }

        std::ostringstream subject;
        subject << "[SECURITY] Suspicious activity (score "
                << alert.score << ")";

        std::ostringstream body;
        body << "Account: " << alert.account_id << "\n"
             << "Score: " << alert.score << "\n"
             << "Reason: " << alert.reason << "\n"
             << "Timestamp: " << to_unix(now) << "\n";

        if (!smtp_->send(from_, recipient, subject.str(), body.str())) {
            return false;
        }

        last_sent_[alert.account_id] = now;

        return true;
    }

private:
    static constexpr int RATE_LIMIT_SECONDS = 120;

    std::shared_ptr<SmtpClient> smtp_;
    std::string from_;
    std::unordered_map<std::string, std::chrono::system_clock::time_point> last_sent_;

    static long to_unix(const std::chrono::system_clock::time_point& tp) {
        return std::chrono::duration_cast<std::chrono::seconds>(
            tp.time_since_epoch()
        ).count();
    }
};
