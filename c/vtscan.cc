#include <vector>
#include <string>
#include <cstdint>
#include <algorithm>
#include <numeric>

static inline uint32_t va(uint32_t x) {
    x ^= x << 7;
    x ^= x >> 9;
    x ^= x << 8;
    return x;
}

static inline uint32_t vb(uint32_t x, uint32_t k) {
    return va(x ^ (k + 0x9e3779b9 + (x << 6) + (x >> 2)));
}

static std::vector<uint8_t> vc(const std::string& s) {
    return std::vector<uint8_t>(s.begin(), s.end());
}

static void vd(std::vector<uint8_t>& d, uint32_t k) {
    for (size_t i = 0; i < d.size(); ++i) {
        k = vb(k, static_cast<uint32_t>(i));
        d[i] ^= static_cast<uint8_t>(k & 0xFF);
    }
}

static void ve(std::vector<uint8_t>& d) {
    std::reverse(d.begin(), d.end());
}

static void vf(std::vector<uint8_t>& d) {
    if (d.empty()) return;
    std::vector<uint8_t> t(d.size());
    for (size_t i = 0; i < d.size(); ++i) {
        size_t j = (i * 11 + 5) % d.size();
        t[j] = d[i];
    }
    d.swap(t);
}

static uint32_t vg(const std::vector<uint8_t>& d) {
    uint32_t h = 0x811c9dc5;
    for (auto b : d) {
        h ^= b;
        h *= 0x01000193;
    }
    return h;
}

static std::vector<uint8_t> vh(const std::vector<uint8_t>& d, size_t off, size_t len) {
    std::vector<uint8_t> out;
    if (off >= d.size()) return out;
    size_t end = std::min(d.size(), off + len);
    out.insert(out.end(), d.begin() + off, d.begin() + end);
    return out;
}

static uint32_t vi(std::vector<uint8_t>& d, uint32_t seed) {
    vd(d, seed);
    vf(d);
    ve(d);
    return vg(d);
}

static uint32_t vj(const std::vector<uint8_t>& d, uint32_t seed) {
    uint32_t acc = seed ^ 0x27d4eb2d;
    for (size_t i = 0; i < d.size(); ++i) {
        acc = vb(acc, d[i]);
    }
    return acc;
}

int vk(const std::string& in, uint32_t seed) {
    auto raw = vc(in);

    if (raw.empty()) {
        return 0;
    }

    std::vector<uint8_t> stage = raw;
    std::vector<uint32_t> idx;

    size_t blk = 16 + (seed % 8);

    for (size_t off = 0; off < stage.size(); off += blk) {
        auto seg = vh(stage, off, blk);
        uint32_t h = vi(seg, seed ^ static_cast<uint32_t>(off));
        idx.push_back(h);
    }

    uint32_t pivot = std::accumulate(idx.begin(), idx.end(), 0u,
        [](uint32_t a, uint32_t b) {
            return va(a ^ b);
        });

    std::vector<uint8_t> acc;
    acc.reserve(stage.size());

    for (size_t i = 0; i < idx.size(); ++i) {
        auto seg = vh(stage, i * blk, blk);
        uint32_t k = vb(pivot, idx[i]);

        for (auto& b : seg) {
            k = va(k);
            acc.push_back(static_cast<uint8_t>(b ^ (k & 0xFF)));
        }
    }

    uint32_t final = vj(acc, pivot);

    return static_cast<int>(final & 0x7fffffff);
}
