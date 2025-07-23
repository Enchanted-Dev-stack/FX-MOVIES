#pragma once

#include <string>

namespace adguard {

/**
 * Utility class for URL parsing and manipulation
 */
class UrlParser {
public:
    /**
     * Extract domain from URL
     * @param url The URL to parse
     * @return the domain part
     */
    static std::string extractDomain(const std::string& url);

    /**
     * Extract path from URL
     * @param url The URL to parse
     * @return the path part
     */
    static std::string extractPath(const std::string& url);

    /**
     * Check if URL is valid
     * @param url The URL to validate
     * @return true if valid
     */
    static bool isValidUrl(const std::string& url);

    /**
     * Normalize URL for comparison
     * @param url The URL to normalize
     * @return normalized URL
     */
    static std::string normalizeUrl(const std::string& url);

    /**
     * Check if domain matches pattern (supports wildcards)
     * @param domain The domain to check
     * @param pattern The pattern to match against
     * @return true if matches
     */
    static bool domainMatches(const std::string& domain, const std::string& pattern);

private:
    UrlParser() = delete; // Utility class, no instances
};

} // namespace adguard