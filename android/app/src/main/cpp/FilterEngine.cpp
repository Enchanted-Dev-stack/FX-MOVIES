#include "include/FilterEngine.h"
#include "include/UrlParser.h"
#include <android/log.h>
#include <sstream>
#include <algorithm>

#define LOG_TAG "FilterEngine"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)

namespace adguard {

FilterEngine::FilterEngine() : initialized_(false) {
    LOGD("FilterEngine constructor");
}

FilterEngine::~FilterEngine() {
    LOGD("FilterEngine destructor");
    clearFilters();
}

bool FilterEngine::initialize() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (initialized_) {
        LOGD("FilterEngine already initialized");
        return true;
    }

    LOGI("Initializing FilterEngine");
    
    try {
        // Load default filter rules
        if (!loadDefaultFilters()) {
            LOGE("Failed to load default filters");
            return false;
        }

        initialized_ = true;
        LOGI("FilterEngine initialized successfully with %zu rules", rules_.size());
        return true;
    } catch (const std::exception& e) {
        LOGE("Exception during FilterEngine initialization: %s", e.what());
        return false;
    }
}

bool FilterEngine::loadFilterRules(const std::string& filterContent) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (filterContent.empty()) {
        LOGW("Empty filter content provided");
        return false;
    }

    LOGD("Loading filter rules from content (%zu bytes)", filterContent.size());
    
    std::istringstream stream(filterContent);
    std::string line;
    size_t rulesAdded = 0;
    
    while (std::getline(stream, line)) {
        // Skip empty lines and comments
        if (line.empty() || line[0] == '!' || line[0] == '#') {
            continue;
        }
        
        auto rule = parseFilterRule(line);
        if (rule && rule->isValid()) {
            rules_.push_back(std::move(rule));
            rulesAdded++;
        }
    }
    
    LOGI("Loaded %zu filter rules from content", rulesAdded);
    return rulesAdded > 0;
}

bool FilterEngine::shouldBlock(const std::string& url, 
                              const std::string& documentUrl, 
                              const std::string& resourceType) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (!initialized_ || url.empty()) {
        return false;
    }

    // Normalize URL for consistent matching
    std::string normalizedUrl = UrlParser::normalizeUrl(url);
    std::string domain = UrlParser::extractDomain(normalizedUrl);
    
    // Check whitelist first
    if (whitelistedDomains_.find(domain) != whitelistedDomains_.end()) {
        LOGD("URL allowed by whitelist: %s", url.c_str());
        return false;
    }

    // Convert resource type string to enum
    ResourceType resType = ResourceType::OTHER;
    if (resourceType == "script") resType = ResourceType::SCRIPT;
    else if (resourceType == "image") resType = ResourceType::IMAGE;
    else if (resourceType == "stylesheet") resType = ResourceType::STYLESHEET;
    else if (resourceType == "document") resType = ResourceType::DOCUMENT;
    else if (resourceType == "xmlhttprequest") resType = ResourceType::XMLHTTPREQUEST;

    // Check against filter rules
    bool shouldBlock = false;
    bool hasAllowRule = false;
    
    for (const auto& rule : rules_) {
        if (rule->matches(normalizedUrl, documentUrl, resType)) {
            if (rule->getType() == FilterRuleType::ALLOW) {
                hasAllowRule = true;
                LOGD("URL explicitly allowed by rule: %s", url.c_str());
                break;
            } else if (rule->getType() == FilterRuleType::BLOCK) {
                shouldBlock = true;
                LOGD("URL blocked by rule: %s (pattern: %s)", url.c_str(), rule->getPattern().c_str());
            }
        }
    }
    
    // Allow rules override block rules
    return shouldBlock && !hasAllowRule;
}

bool FilterEngine::updateFilters() {
    LOGI("Updating filter lists");
    
    // In a real implementation, this would:
    // 1. Download latest filter lists from known sources
    // 2. Parse and validate the new rules
    // 3. Replace existing rules with new ones
    // For now, we'll just reload the default filters
    
    std::lock_guard<std::mutex> lock(mutex_);
    clearFilters();
    return loadDefaultFilters();
}

void FilterEngine::clearFilters() {
    std::lock_guard<std::mutex> lock(mutex_);
    rules_.clear();
    whitelistedDomains_.clear();
    LOGD("Filter rules cleared");
}

size_t FilterEngine::getRuleCount() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return rules_.size();
}

bool FilterEngine::loadDefaultFilters() {
    // Load comprehensive ad blocking rules based on real AdGuard/EasyList patterns
    // This includes patterns from EasyList, EasyPrivacy, AdGuard Base, and more
    
    std::string defaultRules = R"(
! ===== COMPREHENSIVE AD BLOCKING RULES =====
! Based on EasyList, EasyPrivacy, AdGuard Base Filter, and AdGuard Tracking Protection

! === MAJOR AD NETWORKS ===
||doubleclick.net^
||googleadservices.com^
||googlesyndication.com^
||googletagmanager.com^
||googletagservices.com^
||google-analytics.com^
||googleanalytics.com^
||adsense.com^
||adsystem.com^
||amazon-adsystem.com^
||facebook.com/tr^
||connect.facebook.net^
||fbcdn.net/tr^

! === TRACKING & ANALYTICS ===
||scorecardresearch.com^
||quantserve.com^
||comscore.com^
||omniture.com^
||adobe.com/b/ss/^
||chartbeat.com^
||hotjar.com^
||fullstory.com^
||mouseflow.com^
||crazyegg.com^
||mixpanel.com^
||segment.com^
||amplitude.com^

! === SOCIAL MEDIA TRACKERS ===
||addthis.com^
||sharethis.com^
||addtoany.com^
||pinterest.com/ct/^
||twitter.com/i/adsct^
||linkedin.com/px/^
||snapchat.com/tr^
||tiktok.com/i18n/pixel^

! === CONTENT RECOMMENDATION ===
||outbrain.com^
||taboola.com^
||revcontent.com^
||mgid.com^
||content.ad^
||zemanta.com^
||plista.com^
||ligatus.com^

! === VIDEO AD NETWORKS ===
||imasdk.googleapis.com^
||doubleclick.net/instream/ad_status.js^
||youtube.com/api/stats/ads^
||googlevideo.com/videoplayback^$redirect=noopmp4-1s
||brightcove.com/services/messagebroker/amf^

! === POPUP & REDIRECT NETWORKS ===
||popads.net^
||popcash.net^
||propellerads.com^
||adnxs.com^
||adsystem.com^
||exoclick.com^
||juicyads.com^
||trafficjunky.net^
||plugrush.com^
||adsterra.com^
||hilltopads.net^
||clickadu.com^
||adspyglass.com^

! === CRYPTOCURRENCY MINERS ===
||coinhive.com^
||coin-hive.com^
||cnhv.co^
||jsecoin.com^
||minero.cc^
||crypto-loot.com^
||webminepool.com^
||deepminer.net^

! === MALWARE & PHISHING ===
||malware.com^
||phishing.com^
||scam.com^
||virus.com^

! === PATH-BASED BLOCKING ===
/ads/*
/ad/*
/advertisement/*
/advertising/*
/tracker/*
/analytics/*
/tracking/*
/pixel.gif*
/beacon.gif*
/collect?*
/track?*
/event?*
/impression?*
/click?*
/redirect?*
/popup*
/popunder*
/interstitial*
/overlay*
/modal*
/lightbox*

! === QUERY PARAMETER BLOCKING ===
$removeparam=utm_source
$removeparam=utm_medium
$removeparam=utm_campaign
$removeparam=utm_content
$removeparam=utm_term
$removeparam=gclid
$removeparam=fbclid
$removeparam=msclkid
$removeparam=twclid

! === ELEMENT HIDING (CSS SELECTORS) ===
##.ad
##.ads
##.advertisement
##.advertising
##.sponsor
##.sponsored
##.popup
##.popunder
##.overlay
##.modal
##.interstitial
##[id*="ad"]
##[class*="ad"]
##[id*="ads"]
##[class*="ads"]
##[id*="sponsor"]
##[class*="sponsor"]
##[id*="popup"]
##[class*="popup"]

! === WILDCARD PATTERNS ===
*ads*
*advertisement*
*advertising*
*tracker*
*analytics*
*tracking*
*doubleclick*
*googleads*
*googlesyndication*
*facebook.com/tr*
*outbrain*
*taboola*
*popup*
*popunder*
*redirect*

! === SPECIFIC STREAMING SITE PATTERNS ===
||ads.yahoo.com^
||advertising.com^
||adsystem.com^
||adnxs.com^
||adsafeprotected.com^
||moatads.com^
||adsymptotic.com^
||amazon-adsystem.com^
||googlesyndication.com/safeframe^
||tpc.googlesyndication.com^
||pagead2.googlesyndication.com^
||partner.googleadservices.com^
||googleadservices.com/pagead^
||doubleclick.net/gampad^
||securepubads.g.doubleclick.net^

! === MOBILE SPECIFIC ===
||admob.com^
||chartboost.com^
||flurry.com^
||inmobi.com^
||millennialmedia.com^
||mobclix.com^
||tapjoy.com^
||unity3d.com/webgl^

! === WHITELIST EXCEPTIONS ===
@@||moviehive.pro^
@@||123moviesfree.net^
@@||ww5.123moviesfree.net^
@@||github.com^
@@||stackoverflow.com^
@@||mozilla.org^
@@||wikipedia.org^
)";

    return loadFilterRules(defaultRules);
}

std::unique_ptr<FilterRule> FilterEngine::parseFilterRule(const std::string& line) {
    if (line.empty() || line[0] == '!' || line[0] == '#') {
        return nullptr;
    }
    
    std::string trimmedLine = line;
    // Remove leading/trailing whitespace
    trimmedLine.erase(0, trimmedLine.find_first_not_of(" \t\r\n"));
    trimmedLine.erase(trimmedLine.find_last_not_of(" \t\r\n") + 1);
    
    if (trimmedLine.empty()) {
        return nullptr;
    }
    
    FilterRuleType type = FilterRuleType::BLOCK;
    
    // Check for exception rules (whitelist)
    if (trimmedLine.substr(0, 2) == "@@") {
        type = FilterRuleType::ALLOW;
        trimmedLine = trimmedLine.substr(2);
    }
    
    try {
        auto rule = std::make_unique<FilterRule>(trimmedLine, type);
        return rule;
    } catch (const std::exception& e) {
        LOGW("Failed to parse filter rule: %s (error: %s)", line.c_str(), e.what());
        return nullptr;
    }
}

} // namespace adguard