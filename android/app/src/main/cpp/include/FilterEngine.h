#pragma once

#include <string>
#include <vector>
#include <memory>
#include <mutex>
#include <unordered_set>
#include "FilterRule.h"

namespace adguard {

/**
 * Main filter engine for ad blocking
 * Manages filter rules and provides URL filtering functionality
 */
class FilterEngine {
public:
    FilterEngine();
    ~FilterEngine();

    /**
     * Initialize the filter engine with default filter lists
     * @return true if initialization successful
     */
    bool initialize();

    /**
     * Load filter rules from string content
     * @param filterContent The filter list content
     * @return true if loading successful
     */
    bool loadFilterRules(const std::string& filterContent);

    /**
     * Check if a URL should be blocked
     * @param url The URL to check
     * @param documentUrl The document URL (for context)
     * @param resourceType The type of resource (script, image, etc.)
     * @return true if the URL should be blocked
     */
    bool shouldBlock(const std::string& url, 
                    const std::string& documentUrl = "", 
                    const std::string& resourceType = "");

    /**
     * Update filter lists from remote sources
     * @return true if update successful
     */
    bool updateFilters();

    /**
     * Clear all loaded filter rules
     */
    void clearFilters();

    /**
     * Get the number of loaded filter rules
     * @return number of rules
     */
    size_t getRuleCount() const;

private:
    std::vector<std::unique_ptr<FilterRule>> rules_;
    std::unordered_set<std::string> whitelistedDomains_;
    mutable std::mutex mutex_;
    bool initialized_;

    /**
     * Load default filter lists (EasyList, EasyPrivacy, etc.)
     */
    bool loadDefaultFilters();

    /**
     * Parse a single filter rule line
     * @param line The filter rule line
     * @return parsed FilterRule or nullptr if invalid
     */
    std::unique_ptr<FilterRule> parseFilterRule(const std::string& line);
};

} // namespace adguard