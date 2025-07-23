#include "include/UrlParser.h"
#include <android/log.h>
#include <algorithm>
#include <regex>

#define LOG_TAG "UrlParser"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)

namespace adguard {

std::string UrlParser::extractDomain(const std::string& url) {
    if (url.empty()) {
        return "";
    }
    
    try {
        std::string workingUrl = url;
        
        // Remove protocol
        size_t protocolEnd = workingUrl.find("://");
        if (protocolEnd != std::string::npos) {
            workingUrl = workingUrl.substr(protocolEnd + 3);
        }
        
        // Remove path, query, and fragment
        size_t pathStart = workingUrl.find('/');
        if (pathStart != std::string::npos) {
            workingUrl = workingUrl.substr(0, pathStart);
        }
        
        size_t queryStart = workingUrl.find('?');
        if (queryStart != std::string::npos) {
            workingUrl = workingUrl.substr(0, queryStart);
        }
        
        size_t fragmentStart = workingUrl.find('#');
        if (fragmentStart != std::string::npos) {
            workingUrl = workingUrl.substr(0, fragmentStart);
        }
        
        // Remove port
        size_t portStart = workingUrl.find(':');
        if (portStart != std::string::npos) {
            workingUrl = workingUrl.substr(0, portStart);
        }
        
        // Convert to lowercase for consistent comparison
        std::transform(workingUrl.begin(), workingUrl.end(), workingUrl.begin(), ::tolower);
        
        return workingUrl;
    } catch (const std::exception& e) {
        LOGW("Failed to extract domain from URL: %s (error: %s)", url.c_str(), e.what());
        return "";
    }
}

std::string UrlParser::extractPath(const std::string& url) {
    if (url.empty()) {
        return "";
    }
    
    try {
        std::string workingUrl = url;
        
        // Remove protocol
        size_t protocolEnd = workingUrl.find("://");
        if (protocolEnd != std::string::npos) {
            workingUrl = workingUrl.substr(protocolEnd + 3);
        }
        
        // Find start of path
        size_t pathStart = workingUrl.find('/');
        if (pathStart == std::string::npos) {
            return "/"; // No path, return root
        }
        
        workingUrl = workingUrl.substr(pathStart);
        
        // Remove query and fragment
        size_t queryStart = workingUrl.find('?');
        if (queryStart != std::string::npos) {
            workingUrl = workingUrl.substr(0, queryStart);
        }
        
        size_t fragmentStart = workingUrl.find('#');
        if (fragmentStart != std::string::npos) {
            workingUrl = workingUrl.substr(0, fragmentStart);
        }
        
        return workingUrl;
    } catch (const std::exception& e) {
        LOGW("Failed to extract path from URL: %s (error: %s)", url.c_str(), e.what());
        return "";
    }
}

bool UrlParser::isValidUrl(const std::string& url) {
    if (url.empty() || url.length() > 2048) { // Reasonable URL length limit
        return false;
    }
    
    try {
        // Basic URL validation regex
        std::regex urlRegex(
            R"(^https?://[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(/.*)?$)",
            std::regex_constants::icase
        );
        
        return std::regex_match(url, urlRegex);
    } catch (const std::exception& e) {
        LOGW("Exception in URL validation: %s", e.what());
        return false;
    }
}

std::string UrlParser::normalizeUrl(const std::string& url) {
    if (url.empty()) {
        return "";
    }
    
    try {
        std::string normalized = url;
        
        // Convert to lowercase (except path part which should preserve case)
        size_t protocolEnd = normalized.find("://");
        if (protocolEnd != std::string::npos) {
            // Convert protocol to lowercase
            std::transform(normalized.begin(), normalized.begin() + protocolEnd, 
                          normalized.begin(), ::tolower);
            
            // Find domain part and convert to lowercase
            size_t domainStart = protocolEnd + 3;
            size_t pathStart = normalized.find('/', domainStart);
            size_t domainEnd = (pathStart != std::string::npos) ? pathStart : normalized.length();
            
            std::transform(normalized.begin() + domainStart, normalized.begin() + domainEnd,
                          normalized.begin() + domainStart, ::tolower);
        }
        
        // Remove trailing slash if it's the only path component
        if (normalized.length() > 1 && normalized.back() == '/') {
            size_t lastSlash = normalized.find_last_of('/');
            size_t protocolSlashes = normalized.find("://");
            if (protocolSlashes != std::string::npos && lastSlash > protocolSlashes + 2) {
                // Only remove if this isn't the protocol separator
                normalized.pop_back();
            }
        }
        
        return normalized;
    } catch (const std::exception& e) {
        LOGW("Failed to normalize URL: %s (error: %s)", url.c_str(), e.what());
        return url; // Return original on error
    }
}

bool UrlParser::domainMatches(const std::string& domain, const std::string& pattern) {
    if (domain.empty() || pattern.empty()) {
        return false;
    }
    
    try {
        // Exact match
        if (domain == pattern) {
            return true;
        }
        
        // Wildcard subdomain match (*.example.com matches sub.example.com)
        if (pattern.front() == '*' && pattern.length() > 1) {
            std::string patternSuffix = pattern.substr(1);
            if (patternSuffix.front() == '.') {
                // Pattern like *.example.com
                return domain.length() > patternSuffix.length() && 
                       domain.substr(domain.length() - patternSuffix.length()) == patternSuffix;
            }
        }
        
        // Subdomain match (example.com matches sub.example.com)
        if (domain.length() > pattern.length()) {
            std::string suffix = "." + pattern;
            return domain.substr(domain.length() - suffix.length()) == suffix;
        }
        
        return false;
    } catch (const std::exception& e) {
        LOGW("Exception in domain matching: %s", e.what());
        return false;
    }
}

} // namespace adguard