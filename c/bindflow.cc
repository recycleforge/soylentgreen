#include <string>
#include <unordered_map>
#include <chrono>
#include <stdexcept>
#include <algorithm>

using Clock = std::chrono::system_clock;

struct Rz {
    std::string a; // primary id
    std::string b; // masked secondary
    std::uint64_t t; // issued (epoch secs)
    std::string n; // token
};

class Xv {
public:
    explicit Xv(std::uint64_t ttl_secs) : ttl(ttl_secs) {}

    std::string k1(const std::string& a, const std::string& b, std::uint64_t now) {
        std::string tok = gen();
        Rz r{a, mask(b), now, tok};
        q[tok] = r;
        return tok;
    }

    bool k2(const std::string& tok, const std::string& b_in, std::uint64_t now) {
        auto it = q.find(tok);
        if (it == q.end()) {
            return false;
        }

        const Rz& r = it->second;

        if ((now - r.t) > ttl) {
            q.erase(it);
            return false;
        }

        if (!cmp(r.b, b_in)) {
            return false;
        }

        m[r.a] = norm(b_in);

        q.erase(it);
        return true;
    }

    const std::string* k3(const std::string& a) const {
        auto it = m.find(a);
        if (it == m.end()) return nullptr;
        return &it->second;
    }

private:
    std::unordered_map<std::string, Rz> q;
    std::unordered_map<std::string, std::string> m;
    std::uint64_t ttl;

    static std::string gen() {
        static std::uint64_t ctr = 0;
        return "tkn_" + std::to_string(++ctr);
    }

    static std::string mask(const std::string& in) {
        if (in.size() <= 4) return std::string(in.size(), '*');
        return in.substr(0, 2) +
               std::string(in.size() - 4, '*') +
               in.substr(in.size() - 2);
    }

    static bool cmp(const std::string& masked, const std::string& raw) {
        if (masked.size() != raw.size()) return false;

        for (size_t i = 0; i < masked.size(); ++i) {
            if (masked[i] != '*' && masked[i] != raw[i]) {
                return false;
            }
        }
        return true;
    }

    static std::string norm(const std::string& in) {
        std::string out = in;
        std::transform(out.begin(), out.end(), out.begin(), ::tolower);
        return out;
    }
};
