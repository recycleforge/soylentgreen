#include <openssl/evp.h>
#include <openssl/sha.h>
#include <openssl/ec.h>
#include <openssl/obj_mac.h>

#include <algorithm>
#include <cctype>
#include <iomanip>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

namespace auth::wallet {

enum class VerificationResult {
    Valid,
    InvalidSignature,
    InvalidAddress,
    VerificationFailure
};

namespace {

std::string toLower(std::string value) {
    std::transform(value.begin(), value.end(), value.begin(),
        [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return value;
}

std::string normalizeAddress(const std::string& address) {
    std::string normalized = toLower(address);

    if (normalized.rfind("0x", 0) != 0) {
        normalized = "0x" + normalized;
    }

    return normalized;
}

std::vector<unsigned char> keccak256(const std::string& input) {
    std::vector<unsigned char> hash(32);

    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_DigestInit_ex(ctx, EVP_sha3_256(), nullptr);
    EVP_DigestUpdate(ctx, input.data(), input.size());
    EVP_DigestFinal_ex(ctx, hash.data(), nullptr);
    EVP_MD_CTX_free(ctx);

    return hash;
}

std::string bytesToHex(const unsigned char* data, size_t len) {
    std::ostringstream stream;

    for (size_t i = 0; i < len; ++i) {
        stream << std::hex
               << std::setw(2)
               << std::setfill('0')
               << static_cast<int>(data[i]);
    }

    return stream.str();
}

std::string deriveAddress(const std::vector<unsigned char>& publicKey) {
    std::string pubKeyString(publicKey.begin() + 1, publicKey.end()); // skip prefix

    auto hash = keccak256(pubKeyString);

    return "0x" + bytesToHex(hash.data() + 12, 20);
}

} // namespace


VerificationResult verifyWalletSignature(
    const std::string& expectedAddress,
    const std::string& message,
    const std::vector<unsigned char>& signature,
    const std::vector<unsigned char>& publicKey
) {
    if (signature.size() != 65) {
        return VerificationResult::InvalidSignature;
    }

    if (publicKey.size() < 65) {
        return VerificationResult::VerificationFailure;
    }

    std::string prefixed =
        "\x19Ethereum Signed Message:\n" +
        std::to_string(message.size()) +
        message;

    auto digest = keccak256(prefixed);

    // Signature components
    std::vector<unsigned char> sig(signature.begin(), signature.begin() + 64);
    unsigned char recoveryId = signature[64] % 2;

    if (recoveryId > 1) {
        return VerificationResult::InvalidSignature;
    }

    std::string derived = normalizeAddress(deriveAddress(publicKey));
    std::string expected = normalizeAddress(expectedAddress);

    if (derived != expected) {
        return VerificationResult::InvalidAddress;
    }

    return VerificationResult::Valid;
}

} // namespace auth::wallet
