#include "include/FilterRule.h"
#include "include/UrlParser.h"
#include <android/log.h>
#include <algorithm>
#include <sstream>

#define LOG_TAG "FilterRule"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)

namespace adguard {

FilterRule::FilterRule(const std::string& pattern, FilterRuleType type)
    : pattern_(pattern), type_(type), valid_(false), isRegex_(false) {
    initialize();
}

FilterRule::~FilterRule() = default;

void FilterRule::initialize() {
    if (pattern_.empty()) {
        return;
    }
    
    try {
        // Check if this is a regex pattern
        if (pattern_.front() == '/' && pattern_.back() == '/') {
            isRegex_ = true;
            std::string regexPattern = pattern_.substr(1, pattern_.length() - 2);
            regex_ = std::regex(regexPattern, std::regex_constants::icase);
            valid_ = true;
            return;
        }
        
        // Handle domain-based rules (||example.com^)
        if (pattern_.substr(0, 2) == "||" && pattern_.back() == '^') {
            // This is a domain-based rule
            valid_ = true;
            return;
        }
        
        // Handle path-based rules
        if (pattern_.find('*') != std::string::npos || 
            pattern_.find('^') != std::string::npos) {
            // Convert AdBlock pattern to regex
            std::string regexPattern = convertToRegex(pattern_);
            regex_ = std::regex(regexPattern, std::regex_constants::icase);
            isRegex_ = true;
            valid_ = true;
            return;
        }
        
        // Simple substring match
        valid_ = true;
    } catch (const std::exception& e) {
        LOGW("Failed to initialize filter rule: %s (error: %s)", pattern_.c_str(), e.what());
        valid_ = false;
    }
}

bool FilterRule::matches(const std::string& url, 
                        const std::string& documentUrl,
                        ResourceType resourceType) const {
    if (!valid_ || url.empty()) {
        return false;
    }
    
    // Check resource type restrictions
    if (!checkResourceTypeRestrictions(resourceType)) {
        return false;
    }
    
    // Check domain restrictions
    if (!checkDomainRestrictions(documentUrl)) {
        return false;
    }
    
    // Check pattern match
    return matchesPattern(url);
}

bool FilterRule::matchesPattern(const std::string& url) const {
    try {
        // Domain-based rule (||example.com^)
        if (pattern_.substr(0, 2) == "||" && pattern_.back() == '^') {
            std::string domain = pattern_.substr(2, pattern_.length() - 3);
            std::string urlDomain = UrlParser::extractDomain(url);
            return UrlParser::domainMatches(urlDomain, domain);
        }
        
        // Regex pattern
        if (isRegex_) {
            return std::regex_search(url, regex_);
        }
        
        // Simple substring match
        return url.find(pattern_) != std::string::npos;
    } catch (const std::exception& e) {
        LOGW("Exception in pattern matching: %s", e.what());
        return false;
    }
}

bool FilterRule::checkDomainRestrictions(const std::string& documentUrl) const {
    if (includeDomains_.empty() && excludeDomains_.empty()) {
        return true; // No domain restrictions
    }
    
    if (documentUrl.empty()) {
        return includeDomains_.empty(); // Allow if no include restrictions
    }
    
    std::string domain = UrlParser::extractDomain(documentUrl);
    
    // Check exclude domains first
    for (const auto& excludeDomain : excludeDomains_) {
        if (UrlParser::domainMatches(domain, excludeDomain)) {
            return false;
        }
    }
    
    // Check include domains
    if (!includeDomains_.empty()) {
        for (const auto& includeDomain : includeDomains_) {
            if (UrlParser::domainMatches(domain, includeDomain)) {
                return true;
            }
        }
        return false; // Domain not in include list
    }
    
    return true;
}

bool FilterRule::checkResourceTypeRestrictions(ResourceType resourceType) const {
    if (includeTypes_.empty() && excludeTypes_.empty()) {
        return true; // No type restrictions
    }
    
    // Check exclude types first
    for (ResourceType excludeType : excludeTypes_) {
        if (resourceType == excludeType) {
            return false;
        }
    }
    
    // Check include types
    if (!includeTypes_.empty()) {
        for (ResourceType includeType : includeTypes_) {
            if (resourceType == includeType) {
                return true;
            }
        }
        return false; // Type not in include list
    }
    
    return true;
}

void FilterRule::addDomainRestriction(const std::string& domain, bool include) {
    if (include) {
        includeDomains_.push_back(domain);
    } else {
        excludeDomains_.push_back(domain);
    }
}

void FilterRule::addResourceTypeRestriction(ResourceType type, bool include) {
    if (include) {
        includeTypes_.push_back(type);
    } else {
        excludeTypes_.push_back(type);
    }
}

ResourceType FilterRule::stringToResourceType(const std::string& type) {
    if (type == "script") return ResourceType::SCRIPT;
    if (type == "image") return ResourceType::IMAGE;
    if (type == "stylesheet") return ResourceType::STYLESHEET;
    if (type == "object") return ResourceType::OBJECT;
    if (type == "xmlhttprequest") return ResourceType::XMLHTTPREQUEST;
    if (type == "subdocument") return ResourceType::SUBDOCUMENT;
    if (type == "ping") return ResourceType::PING;
    if (type == "websocket") return ResourceType::WEBSOCKET;
    if (type == "document") return ResourceType::DOCUMENT;
    return ResourceType::OTHER;
}

std::string FilterRule::convertToRegex(const std::string& pattern) const {
    std::string result = pattern;
    
    // Escape regex special characters except * and ^
    std::string specialChars = ".+?()[]{}|\\";
    for (char c : specialChars) {
        size_t pos = 0;
        std::string target(1, c);
        std::string replacement = "\\" + target;
        while ((pos = result.find(target, pos)) != std::string::npos) {
            result.replace(pos, 1, replacement);
            pos += replacement.length();
        }
    }
    
    // Convert AdBlock wildcards to regex
    // * -> .*
    size_t pos = 0;
    while ((pos = result.find("*", pos)) != std::string::npos) {
        result.replace(pos, 1, ".*");
        pos += 2;
    }
    
    // ^ -> end of domain or path separator
    pos = 0;
    while ((pos = result.find("^", pos)) != std::string::npos) {
        result.replace(pos, 1, "[/?&=:]");
        pos += 7;
    }
    
    return result;
}

} // namespace adguard