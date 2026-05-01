#include <chrono>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>

namespace fs = std::filesystem;

struct LogEntry {
    std::chrono::system_clock::time_point timestamp;
    std::string level;
    std::string message;
    std::optional<std::string> context_json; // already JSON-encoded if present
};

std::string format_timestamp(const std::chrono::system_clock::time_point& tp) {
    std::time_t t = std::chrono::system_clock::to_time_t(tp);

    std::tm tm{};
#if defined(_WIN32)
    gmtime_s(&tm, &t);
#else
    gmtime_r(&t, &tm);
#endif

    std::ostringstream oss;
    oss << std::put_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
    return oss.str();
}

std::string format_date(const std::chrono::system_clock::time_point& tp) {
    std::time_t t = std::chrono::system_clock::to_time_t(tp);

    std::tm tm{};
#if defined(_WIN32)
    gmtime_s(&tm, &t);
#else
    gmtime_r(&t, &tm);
#endif

    std::ostringstream oss;
    oss << std::put_time(&tm, "%Y-%m-%d");
    return oss.str();
}

std::string json_escape(const std::string& input) {
    std::ostringstream oss;
    for (char c : input) {
        switch (c) {
            case '\"': oss << "\\\""; break;
            case '\\': oss << "\\\\"; break;
            case '\b': oss << "\\b"; break;
            case '\f': oss << "\\f"; break;
            case '\n': oss << "\\n"; break;
            case '\r': oss << "\\r"; break;
            case '\t': oss << "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    oss << "\\u"
                        << std::hex << std::setw(4) << std::setfill('0')
                        << static_cast<int>(c);
                } else {
                    oss << c;
                }
        }
    }
    return oss.str();
}

std::string to_json(const LogEntry& entry) {
    std::ostringstream oss;

    oss << "{";
    oss << "\"timestamp\":\"" << format_timestamp(entry.timestamp) << "\",";
    oss << "\"level\":\"" << json_escape(entry.level) << "\",";
    oss << "\"message\":\"" << json_escape(entry.message) << "\"";

    if (entry.context_json.has_value()) {
        oss << ",\"context\":" << entry.context_json.value();
    }

    oss << "}";

    return oss.str();
}

// Append log entry to daily file
void append_daily_log(const fs::path& base_dir, const LogEntry& entry) {
    // Ensure directory exists
    std::error_code ec;
    fs::create_directories(base_dir, ec);
    if (ec) {
        throw std::runtime_error("Failed to create log directory: " + ec.message());
    }

    // Build file path: YYYY-MM-DD.log
    std::string date = format_date(entry.timestamp);
    fs::path file_path = base_dir / (date + ".log");

    // Open file in append mode
    std::ofstream out(file_path, std::ios::out | std::ios::app);
    if (!out.is_open()) {
        throw std::runtime_error("Failed to open log file: " + file_path.string());
    }

    // Write NDJSON line
    out << to_json(entry) << "\n";

    if (!out.good()) {
        throw std::runtime_error("Failed to write log entry");
    }
}
