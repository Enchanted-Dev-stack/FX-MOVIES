#include <jni.h>
#include <string>
#include <android/log.h>
#include <memory>
#include <mutex>
#include "include/UrlParser.h"
#include "include/FilterEngine.h"

#define LOG_TAG "AdGuardJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)

// Helper class for JNI string handling
class JStringHelper {
private:
    JNIEnv* env;
    jstring jstr;
    const char* cstr;
    jboolean is_copy;
    
public:
    JStringHelper(JNIEnv* env, jstring jstr) : env(env), jstr(jstr), cstr(nullptr), is_copy(false) {
        if (jstr != nullptr) {
            cstr = env->GetStringUTFChars(jstr, &is_copy);
        }
    }
    
    ~JStringHelper() {
        if (cstr != nullptr && jstr != nullptr) {
            env->ReleaseStringUTFChars(jstr, cstr);
        }
    }
    
    const char* c_str() const { return cstr; }
    bool isValid() const { return cstr != nullptr; }
    size_t length() const { return cstr ? strlen(cstr) : 0; }
};

// Global state for the filtering engine
static std::unique_ptr<adguard::FilterEngine> g_filter_engine;
static std::mutex g_mutex;
static bool g_initialized = false;

extern "C" {

/**
 * Initialize the native filtering engine
 * @param env JNI environment
 * @param thiz Java object reference
 * @return true if initialization successful
 */
JNIEXPORT jboolean JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeInit(JNIEnv *env, jobject thiz) {
    const char* function_name = "nativeInit";
    std::lock_guard<std::mutex> lock(g_mutex);
    
    if (g_initialized) {
        LOGD("[%s] Native filtering engine already initialized", function_name);
        return JNI_TRUE;
    }
    
    LOGI("[%s] Initializing native filtering engine", function_name);
    
    try {
        // Initialize FilterEngine
        g_filter_engine = std::make_unique<adguard::FilterEngine>();
        
        if (!g_filter_engine->initialize()) {
            LOGE("[%s] Failed to initialize FilterEngine", function_name);
            g_filter_engine.reset();
            return JNI_FALSE;
        }
        
        g_initialized = true;
        LOGI("[%s] Native filtering engine initialized successfully", function_name);
        return JNI_TRUE;
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during initialization: %s", function_name, e.what());
        g_initialized = false;
        return JNI_FALSE;
    }
}

/**
 * Filter a URL through the native filtering engine
 * @param env JNI environment
 * @param thiz Java object reference
 * @param url The URL to filter
 * @return true if the URL should be blocked
 */
JNIEXPORT jboolean JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeFilterUrl(JNIEnv *env, jobject thiz, jstring url) {
    const char* function_name = "nativeFilterUrl";
    
    if (env == nullptr) {
        LOGE("[%s] JNI environment is null", function_name);
        return JNI_FALSE;
    }
    
    if (url == nullptr) {
        LOGE("[%s] URL parameter is null", function_name);
        return JNI_FALSE;
    }

    if (!g_initialized) {
        LOGE("[%s] Native filtering engine not initialized", function_name);
        return JNI_FALSE;
    }

    JStringHelper urlHelper(env, url);
    if (!urlHelper.isValid()) {
        LOGE("[%s] Failed to get URL string from JNI", function_name);
        return JNI_FALSE;
    }

    try {
        std::string urlString(urlHelper.c_str());
        
        LOGD("[%s] Filtering URL: %s", function_name, urlHelper.c_str());
        
        bool shouldBlock = false;
        if (g_filter_engine) {
            shouldBlock = g_filter_engine->shouldBlock(urlString);
            if (shouldBlock) {
                LOGD("[%s] URL blocked: %s", function_name, urlHelper.c_str());
            }
        }
        
        return shouldBlock ? JNI_TRUE : JNI_FALSE;
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during URL filtering: %s", function_name, e.what());
        return JNI_FALSE; // Default to allow on error
    }
}

/**
 * Load filter rules into the native filtering engine
 * @param env JNI environment
 * @param thiz Java object reference
 * @param filterContent The filter rules content
 * @return true if loading successful
 */
JNIEXPORT jboolean JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeLoadFilterRules(JNIEnv *env, jobject thiz, jstring filterContent) {
    const char* function_name = "nativeLoadFilterRules";
    
    if (env == nullptr) {
        LOGE("[%s] JNI environment is null", function_name);
        return JNI_FALSE;
    }
    
    if (filterContent == nullptr) {
        LOGE("[%s] Filter content parameter is null", function_name);
        return JNI_FALSE;
    }

    if (!g_initialized) {
        LOGE("[%s] Native filtering engine not initialized", function_name);
        return JNI_FALSE;
    }

    JStringHelper contentHelper(env, filterContent);
    if (!contentHelper.isValid()) {
        LOGE("[%s] Failed to get filter content string from JNI", function_name);
        return JNI_FALSE;
    }

    try {
        std::string contentString(contentHelper.c_str());
        
        LOGD("[%s] Loading filter rules (%zu bytes)", function_name, contentString.size());
        
        bool success = false;
        if (g_filter_engine) {
            success = g_filter_engine->loadFilterRules(contentString);
            if (success) {
                LOGI("[%s] Filter rules loaded successfully", function_name);
            } else {
                LOGW("[%s] Failed to load filter rules", function_name);
            }
        }
        
        return success ? JNI_TRUE : JNI_FALSE;
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during filter rules loading: %s", function_name, e.what());
        return JNI_FALSE;
    }
}

/**
 * Clear all filter rules from the native filtering engine
 * @param env JNI environment
 * @param thiz Java object reference
 * @return true if clearing successful
 */
JNIEXPORT jboolean JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeClearFilters(JNIEnv *env, jobject thiz) {
    const char* function_name = "nativeClearFilters";
    
    if (!g_initialized) {
        LOGE("[%s] Native filtering engine not initialized", function_name);
        return JNI_FALSE;
    }

    try {
        LOGD("[%s] Clearing filter rules", function_name);
        
        if (g_filter_engine) {
            g_filter_engine->clearFilters();
            LOGI("[%s] Filter rules cleared successfully", function_name);
        }
        
        return JNI_TRUE;
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during filter clearing: %s", function_name, e.what());
        return JNI_FALSE;
    }
}

/**
 * Cleanup the native filtering engine
 * @param env JNI environment
 * @param thiz Java object reference
 */
JNIEXPORT void JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeCleanup(JNIEnv *env, jobject thiz) {
    const char* function_name = "nativeCleanup";
    std::lock_guard<std::mutex> lock(g_mutex);
    
    if (!g_initialized) {
        LOGD("[%s] Native filtering engine already cleaned up", function_name);
        return;
    }
    
    LOGI("[%s] Cleaning up native filtering engine", function_name);
    
    try {
        if (g_filter_engine) {
            g_filter_engine->clearFilters();
            g_filter_engine.reset();
        }
        
        g_initialized = false;
        LOGI("[%s] Native filtering engine cleanup completed", function_name);
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during cleanup: %s", function_name, e.what());
        g_initialized = false; // Force cleanup state even on error
    }
}

/**
 * Normalize a URL using the UrlParser utility
 * @param env JNI environment
 * @param thiz Java object reference
 * @param url The URL to normalize
 * @return normalized URL string
 */
JNIEXPORT jstring JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeNormalizeUrl(JNIEnv *env, jobject thiz, jstring url) {
    const char* function_name = "nativeNormalizeUrl";
    
    if (env == nullptr) {
        LOGE("[%s] JNI environment is null", function_name);
        return nullptr;
    }
    
    if (url == nullptr) {
        LOGE("[%s] URL parameter is null", function_name);
        return nullptr;
    }

    JStringHelper urlHelper(env, url);
    if (!urlHelper.isValid()) {
        LOGE("[%s] Failed to get URL string from JNI", function_name);
        return nullptr;
    }

    try {
        std::string urlString(urlHelper.c_str());
        std::string normalizedUrl = adguard::UrlParser::normalizeUrl(urlString);
        
        LOGD("[%s] Normalized URL: %s -> %s", function_name, urlHelper.c_str(), normalizedUrl.c_str());
        
        return env->NewStringUTF(normalizedUrl.c_str());
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during URL normalization: %s", function_name, e.what());
        return nullptr;
    }
}

/**
 * Extract domain from a URL using the UrlParser utility
 * @param env JNI environment
 * @param thiz Java object reference
 * @param url The URL to extract domain from
 * @return domain string
 */
JNIEXPORT jstring JNICALL
Java_com_moview_adblocker_AdBlockerManager_nativeExtractDomain(JNIEnv *env, jobject thiz, jstring url) {
    const char* function_name = "nativeExtractDomain";
    
    if (env == nullptr) {
        LOGE("[%s] JNI environment is null", function_name);
        return nullptr;
    }
    
    if (url == nullptr) {
        LOGE("[%s] URL parameter is null", function_name);
        return nullptr;
    }

    JStringHelper urlHelper(env, url);
    if (!urlHelper.isValid()) {
        LOGE("[%s] Failed to get URL string from JNI", function_name);
        return nullptr;
    }

    try {
        std::string urlString(urlHelper.c_str());
        std::string domain = adguard::UrlParser::extractDomain(urlString);
        
        LOGD("[%s] Extracted domain: %s -> %s", function_name, urlHelper.c_str(), domain.c_str());
        
        return env->NewStringUTF(domain.c_str());
    } catch (const std::exception& e) {
        LOGE("[%s] Exception during domain extraction: %s", function_name, e.what());
        return nullptr;
    }
}

} // extern "C"