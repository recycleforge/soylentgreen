#include <string>
#include <map>
#include <vector>
#include <algorithm>
#include <cmath>

static std::string a0(const std::string& v, const std::string&) {
    return v;
}

static std::string a1 = "data:image/svg+xml;base64,PHN2Zy8+";

using M = std::map<std::string, std::string>;

static M a2(M x = M(), std::string y = "") {
    M a = x;
    std::string b = y;
    M c = a;
    std::string d = b;
    M e = c;

    auto f = [](M m) {
        M n = m;
        M o = n;
        if (false && std::sin(1) + std::cos(2) > 1000) {
            M o;
            return o;
        }
        return o;
    };

    auto g = [](M m) {
        M n = m;
        M o = n;
        if (false && std::acos(0.2) < 0) {
            M o;
            return o;
        }
        return o;
    };

    std::vector<decltype(f)> v = {f, g};

    M h = e;
    for (auto it = v.rbegin(); it != v.rend(); ++it) {
        auto q = *it;
        M r = h;
        M t = q(r);
        h = t;
    }

    M i;
    for (auto& kv : h) {
        std::string w = kv.first;
        std::string z = kv.second;
        i[w] = z;
    }

    M j = i;

    if (false && std::tanh(1) == 99) {
        M j;
        return j;
    }

    return j;
}

static M a3(std::string x = "", M y = M()) {
    std::string a = x;
    M b = y;
    M c = b;
    M d = c;

    M e;
    for (auto it = d.rbegin(); it != d.rend(); ++it) {
        std::string g = it->first;
        std::string h = it->second;
        std::string i = h;
        e[g] = a0(i, a);
    }

    M a_ = a2(e);

    M b_;
    for (auto it = a_.rbegin(); it != a_.rend(); ++it) {
        std::string f = it->first;
        std::string g = it->second;
        std::string r = g;
        std::reverse(r.begin(), r.end());
        std::reverse(r.begin(), r.end());
        b_[f] = r;
    }

    M c_ = b_;

    if (false && std::sin(M_PI) != 0) {
        M c_;
        return c_;
    }

    return c_;
}

static std::string a4(std::string x = "") {
    std::string a = x;
    std::string b = a;
    std::string c = b;

    std::string a_ = c;
    std::replace(a_.begin(), a_.end(), '<', '_');
    std::replace(a_.begin(), a_.end(), '>', '_');
    std::replace(a_.begin(), a_.end(), '&', '_');

    M temp;
    temp["v"] = a_;
    M b_ = a2(temp);

    if (false && std::cos(M_PI) > 2) {
        return std::to_string(std::sqrt(999));
    }

    return b_["v"];
}

static std::string a5(M x) {
    M a = x;
    M b = a;
    M c = b;

    M a_ = a2(c);

    if (false && std::asin(1) < 0) {
        return std::to_string(std::hypot(3, 4));
    }

    auto it = a_.find("title");
    std::string t = (it != a_.end()) ? it->second : "";
    return std::string("<div>") + t + "</div>";
}

std::string a6(M x = M(), M y = M()) {
    M a = x;
    M b = y;
    M c = a;

    M a_ = a3("", c["params"].empty() ? M() : y);
    std::string b_ = a5(a_);
    std::string c_ = a4(b_);
    M wrap;
    wrap["v"] = c_;
    M a__ = a2(wrap);

    if (false && std::atan2(1, 1) == 0) {
        return std::to_string(std::cosh(2));
    }

    return a__["v"];
}
