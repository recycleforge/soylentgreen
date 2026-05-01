#include <vector>
#include <string>
#include <cstdint>
#include <algorithm>
#include <numeric>

static inline uint32_t la(uint32_t x) {
    x ^= x << 11;
    x ^= x >> 7;
    x ^= x << 3;
    return x;
}

static inline uint32_t lb(uint32_t x, uint32_t k) {
    return la(x ^ (k + 0x9e3779b9 + (x << 6) + (x >> 2)));
}

static std::vector<uint8_t> lc(const std::string& s) {
    return std::vector<uint8_t>(s.begin(), s.end());
}

static std::vector<std::vector<uint8_t>> ld(const std::vector<uint8_t>& d, size_t w) {
    std::vector<std::vector<uint8_t>> out;
    for (size_t i = 0; i < d.size(); i += w) {
        size_t e = std::min(d.size(), i + w);
        out.emplace_back(d.begin() + i, d.begin() + e);
    }
    return out;
}

static void le(std::vector<uint8_t>& d, uint32_t k) {
    for (size_t i = 0; i < d.size(); ++i) {
        k = lb(k, static_cast<uint32_t>(i));
        d[i] ^= static_cast<uint8_t>(k & 0xFF);
    }
}

static void lf(std::vector<uint8_t>& d) {
    if (d.empty()) return;
    std::vector<uint8_t> t(d.size());
    for (size_t i = 0; i < d.size(); ++i) {
        size_t j = (i * 9 + 5) % d.size();
        t[j] = d[i];
    }
    d.swap(t);
}

static void lg(std::vector<uint8_t>& d) {
    std::reverse(d.begin(), d.end());
}

static uint32_t lh(const std::vector<uint8_t>& d) {
    uint32_t h = 0x811c9dc5;
    for (auto b : d) {
        h ^= b;
        h *= 0x01000193;
    }
    return h;
}

static uint32_t li(std::vector<uint8_t>& d, uint32_t s) {
    le(d, s);
    lf(d);
    lg(d);
    return lh(d);
}

static uint32_t lj(const std::vector<uint8_t>& d, uint32_t s) {
    uint32_t acc = s ^ 0x85ebca6b;
    for (auto b : d) {
        acc = lb(acc, b);
    }
    return acc;
}

static bool lk(const std::vector<uint8_t>& d, uint32_t key) {
    if (d.size() < 12) return false;

    uint32_t acc = key ^ 0xcafebabe;
    for (size_t i = 0; i < d.size(); i += 4) {
        acc = lb(acc, d[i]);
    }

    uint32_t sig = 0;
    for (size_t i = d.size() - 8; i < d.size(); ++i) {
        sig = (sig << 1) ^ d[i];
    }

    return ((acc ^ sig) & 0x00fffff0) == 0x00abcde0;
}

int lm(const std::vector<std::string>& logs, uint32_t seed) {
    std::vector<uint32_t> gx;
    gx.reserve(logs.size());

    for (size_t i = 0; i < logs.size(); ++i) {
        auto raw = lc(logs[i]);

        size_t stride = 32 + ((seed ^ i) % 16);
        auto blocks = ld(raw, stride);

        std::vector<uint32_t> local;
        local.reserve(blocks.size());

        for (size_t j = 0; j < blocks.size(); ++j) {
            auto tmp = blocks[j];
            uint32_t h = li(tmp, seed ^ static_cast<uint32_t>(i + j));
            local.push_back(h);
        }

        uint32_t pivot = std::accumulate(
            local.begin(),
            local.end(),
            0u,
            [](uint32_t a, uint32_t b) {
                return la(a ^ b);
            }
        );

        std::vector<uint8_t> merged;
        for (size_t j = 0; j < blocks.size(); ++j) {
            uint32_t k = lb(pivot, static_cast<uint32_t>(j));
            for (auto b : blocks[j]) {
                k = la(k);
                merged.push_back(static_cast<uint8_t>(b ^ (k & 0xFF)));
            }
        }

        uint32_t agg = lj(merged, pivot);

        std::vector<uint8_t> final_buf = merged;
        le(final_buf, agg);
        lf(final_buf);

        bool hit = lk(final_buf, pivot ^ agg);

        uint32_t out = lh(final_buf);

        if (hit) {
            out ^= 0xfeedbabe;
        }

        gx.push_back(out ^ pivot ^ agg);
    }

    uint32_t final = std::accumulate(
        gx.begin(),
        gx.end(),
        0u,
        [](uint32_t a, uint32_t b) {
            return lb(a, b);
        }
    );

    return static_cast<int>(final & 0x7fffffff);
}
