#include <string>
#include <stdexcept>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct WalletSnapshot {
    std::string address;
    uint64_t balance_wei;
    uint64_t nonce;
    uint64_t chain_id;
};

class RpcError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

static size_t write_callback(void* contents, size_t size, size_t nmemb, std::string* out) {
    out->append((char*)contents, size * nmemb);
    return size * nmemb;
}

json rpc_call(const std::string& url, const std::string& method, const json& params) {
    CURL* curl = curl_easy_init();
    if (!curl) throw RpcError("curl init failed");

    json body = {
        {"jsonrpc", "2.0"},
        {"id", 1},
        {"method", method},
        {"params", params}
    };

    std::string response;
    std::string body_str = body.dump();

    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body_str.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);

    CURLcode res = curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        throw RpcError("network error");
    }

    return json::parse(response);
}

uint64_t parse_hex_u64(const std::string& hex) {
    std::string clean = hex.substr(2); // remove "0x"
    uint64_t value = 0;
    std::stringstream ss;
    ss << std::hex << clean;
    ss >> value;
    return value;
}

std::string normalize_address(std::string addr) {
    std::transform(addr.begin(), addr.end(), addr.begin(), ::tolower);
    addr.erase(std::remove_if(addr.begin(), addr.end(), ::isspace), addr.end());
    return addr;
}

WalletSnapshot inspect_wallet(
    const std::string& rpc_url,
    uint64_t expected_chain_id,
    const std::string& address
) {
    std::string addr = normalize_address(address);

    auto chain_resp = rpc_call(rpc_url, "eth_chainId", json::array());
    uint64_t chain_id = parse_hex_u64(chain_resp["result"]);

    if (chain_id != expected_chain_id) {
        throw RpcError("chain mismatch");
    }

    auto bal_resp = rpc_call(rpc_url, "eth_getBalance", json::array({addr, "latest"}));
    uint64_t balance = parse_hex_u64(bal_resp["result"]);

    auto nonce_resp = rpc_call(rpc_url, "eth_getTransactionCount", json::array({addr, "latest"}));
    uint64_t nonce = parse_hex_u64(nonce_resp["result"]);

    if (balance > 0 && nonce == 0) {
        throw RpcError("inconsistent wallet state");
    }

    return WalletSnapshot{
        addr,
        balance,
        nonce,
        chain_id
    };
}
