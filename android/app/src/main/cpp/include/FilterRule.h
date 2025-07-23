#pragma once

#include <string>
#include <vector>
#include <regex>

namespace adguard {

/**
 * Types of filter rules
 */
enum class FilterRuleType {
    BLOCK,      // Block the resource
    ALLOW,      // Allow the resource (whitelist)
    REDIRECT,   // Redirect the resource
    MODIFY      // Modify the resource
};

/**
 * Resource types for filtering
 */
enum class ResourceType {
    DOCUMENT,
    SCRIPT,
    IMAGE,
    STYLESHEET,
    OBJECT,
    XMLHTTPREQUEST,
    SUBDOCUMENT,
    PING,
    WEBSOCKET,
    OTHER
};

/**
 * Represents a single filter rule
 */
class FilterRule {
public:
    FilterRule(const std::string& pattern, FilterRuleType type);
    ~FilterRule();

    /**
     * Check if this rule matches the given URL
     * @param url The URL to check
     * @param documentUrl The document URL for context
     * @param resourceType The type of resource
     * @return true if the rule matches
     */
    bool matches(const std::string& url, 
                const std::string& documentUrl = "",
                ResourceType resourceType = ResourceType::OTHER) const;

    /**
     * Get the rule type
     */
    FilterRuleType getType() const { return type_; }

    /**
     * Get the original pattern
     */
    const std::string& getPattern() const { return pattern_; }

    /**
     * Check if the rule is valid
     */
    bool isValid() const { return valid_; }

    /**
     * Add a domain restriction
     */
    void addDomainRestriction(const std::string& domain, bool include);

    /**
     * Add a resource type restriction
     */
    void addResourceTypeRestriction(ResourceType type, bool include);

private:
    std::string pattern_;
    FilterRuleType type_;
    bool valid_;
    bool isRegex_;
    std::regex regex_;
    
    // Domain restrictions
    std::vector<std::string> includeDomains_;
    std::vector<std::string> excludeDomains_;
    
    // Resource type restrictions
    std::vector<ResourceType> includeTypes_;
    std::vector<ResourceType> excludeTypes_;

    /**
     * Initialize the rule from pattern
     */
    void initialize();

    /**
     * Check if URL matches pattern
     */
    bool matchesPattern(const std::string& url) const;

    /**
     * Check domain restrictions
     */
    bool checkDomainRestrictions(const std::string& documentUrl) const;

    /**
     * Check resource type restrictions
     */
    bool checkResourceTypeRestrictions(ResourceType resourceType) const;

    /**
     * Convert string to ResourceType
     */
    static ResourceType stringToResourceType(const std::string& type);

    /**
     * Convert AdBlock pattern to regex
     */
    std::string convertToRegex(const std::string& pattern) const;
};

} // namespace adguard