#include <gtest/gtest.h>
#include <jni.h>
#include <thread>
#include <atomic>
#include <chrono>
#include <vector>
#include "../../main/cpp/include/FilterEngine.h"

// Mock JNI environment for testing
class MockJNIEnv {
public:
    static const char* mockUrl;
    static jstring createMockJString(const char* str) {
        mockUrl = str;
        return reinterpret_cast<jstring>(const_cast<char*>(str));
    }
    
    static const char* GetStringUTFChars(jstring str, jboolean* isCopy) {
        return mockUrl;
    }
    
    static void ReleaseStringUTFChars(jstring str, const char* chars) {
        // Mock implementation - no actual release needed
    }
};

const char* MockJNIEnv::mockUrl = nullptr;

// Test fixture for AdGuard JNI Bridge tests
class AdGuardJNIBridgeTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Initialize filter engine for testing
        filterEngine = std::make_unique<adguard::FilterEngine>();
        ASSERT_TRUE(filterEngine->initialize());
    }
    
    void TearDown() override {
        filterEngine.reset();
    }
    
    std::unique_ptr<adguard::FilterEngine> filterEngine;
};

// Test FilterEngine initialization
TEST_F(AdGuardJNIBridgeTest, FilterEngineInitialization) {
    EXPECT_TRUE(filterEngine != nullptr);
    EXPECT_GT(filterEngine->getRuleCount(), 0);
}

// Test basic URL blocking functionality
TEST_F(AdGuardJNIBridgeTest, BasicUrlBlocking) {
    // Test URLs that should be blocked
    EXPECT_TRUE(filterEngine->shouldBlock("https://doubleclick.net/ads/script.js"));
    EXPECT_TRUE(filterEngine->shouldBlock("https://googleadservices.com/pagead/ads"));
    EXPECT_TRUE(filterEngine->shouldBlock("https://googlesyndication.com/safeframe/ads"));
    EXPECT_TRUE(filterEngine->shouldBlock("https://example.com/ads/banner.jpg"));
    EXPECT_TRUE(filterEngine->shouldBlock("https://tracker.example.com/pixel.gif"));
    
    // Test URLs that should NOT be blocked
    EXPECT_FALSE(filterEngine->shouldBlock("https://example.com/content/article.html"));
    EXPECT_FALSE(filterEngine->shouldBlock("https://google.com/search?q=test"));
    EXPECT_FALSE(filterEngine->shouldBlock("https://github.com/user/repo"));
}

// Test URL normalization and domain extraction
TEST_F(AdGuardJNIBridgeTest, UrlNormalization) {
    // Test that different URL formats for the same resource are handled consistently
    std::string url1 = "https://doubleclick.net/ads/script.js";
    std::string url2 = "HTTPS://DOUBLECLICK.NET/ads/script.js";
    std::string url3 = "https://doubleclick.net/ads/script.js/";
    
    bool result1 = filterEngine->shouldBlock(url1);
    bool result2 = filterEngine->shouldBlock(url2);
    bool result3 = filterEngine->shouldBlock(url3);
    
    EXPECT_EQ(result1, result2);
    EXPECT_EQ(result1, result3);
    EXPECT_TRUE(result1); // All should be blocked
}

// Test filter rule parsing and matching
TEST_F(AdGuardJNIBridgeTest, FilterRuleMatching) {
    // Test domain-based blocking (||domain.com^)
    EXPECT_TRUE(filterEngine->shouldBlock("https://doubleclick.net/anything/here"));
    EXPECT_TRUE(filterEngine->shouldBlock("http://doubleclick.net/"));
    
    // Test path-based blocking (/ads/*)
    EXPECT_TRUE(filterEngine->shouldBlock("https://example.com/ads/banner.png"));
    EXPECT_TRUE(filterEngine->shouldBlock("https://example.com/ads/video/player.js"));
    
    // Test substring matching (*analytics*)
    EXPECT_TRUE(filterEngine->shouldBlock("https://example.com/analytics/track.js"));
    EXPECT_TRUE(filterEngine->shouldBlock("https://analytics.example.com/collect"));
}

// Test performance with large number of URLs
TEST_F(AdGuardJNIBridgeTest, PerformanceTest) {
    const int NUM_URLS = 1000;
    std::vector<std::string> testUrls;
    
    // Generate test URLs
    for (int i = 0; i < NUM_URLS; ++i) {
        if (i % 2 == 0) {
            testUrls.push_back("https://ads" + std::to_string(i) + ".example.com/banner.jpg");
        } else {
            testUrls.push_back("https://content" + std::to_string(i) + ".example.com/article.html");
        }
    }
    
    auto start = std::chrono::high_resolution_clock::now();
    
    int blockedCount = 0;
    for (const auto& url : testUrls) {
        if (filterEngine->shouldBlock(url)) {
            blockedCount++;
        }
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    
    // Expect reasonable performance (less than 1ms per URL on average)
    EXPECT_LT(duration.count(), NUM_URLS * 1000); // 1000 microseconds = 1ms
    
    // Expect some URLs to be blocked (the ads* ones)
    EXPECT_GT(blockedCount, 0);
    EXPECT_LT(blockedCount, NUM_URLS); // Not all should be blocked
}

// Test thread safety
TEST_F(AdGuardJNIBridgeTest, ThreadSafety) {
    const int NUM_THREADS = 4;
    const int URLS_PER_THREAD = 100;
    
    std::vector<std::thread> threads;
    std::atomic<int> totalBlocked(0);
    
    for (int t = 0; t < NUM_THREADS; ++t) {
        threads.emplace_back([&, t]() {
            int localBlocked = 0;
            for (int i = 0; i < URLS_PER_THREAD; ++i) {
                std::string url = "https://test" + std::to_string(t) + "-" + std::to_string(i) + ".doubleclick.net/ads";
                if (filterEngine->shouldBlock(url)) {
                    localBlocked++;
                }
            }
            totalBlocked += localBlocked;
        });
    }
    
    for (auto& thread : threads) {
        thread.join();
    }
    
    // All doubleclick.net URLs should be blocked
    EXPECT_EQ(totalBlocked.load(), NUM_THREADS * URLS_PER_THREAD);
}

// Test filter updates
TEST_F(AdGuardJNIBridgeTest, FilterUpdates) {
    size_t initialRuleCount = filterEngine->getRuleCount();
    EXPECT_GT(initialRuleCount, 0);
    
    // Test filter update
    bool updateResult = filterEngine->updateFilters();
    EXPECT_TRUE(updateResult);
    
    // Rule count should remain consistent after update
    size_t updatedRuleCount = filterEngine->getRuleCount();
    EXPECT_EQ(initialRuleCount, updatedRuleCount);
}

// Test memory management and cleanup
TEST_F(AdGuardJNIBridgeTest, MemoryManagement) {
    // Create multiple filter engines to test memory allocation/deallocation
    std::vector<std::unique_ptr<adguard::FilterEngine>> engines;
    
    for (int i = 0; i < 10; ++i) {
        auto engine = std::make_unique<adguard::FilterEngine>();
        ASSERT_TRUE(engine->initialize());
        engines.push_back(std::move(engine));
    }
    
    // Test that all engines work correctly
    for (const auto& engine : engines) {
        EXPECT_TRUE(engine->shouldBlock("https://doubleclick.net/ads"));
        EXPECT_FALSE(engine->shouldBlock("https://example.com/content"));
    }
    
    // Clear all engines (tests destructor)
    engines.clear();
    
    // This test passes if no memory leaks or crashes occur
    SUCCEED();
}

// Test edge cases and error handling
TEST_F(AdGuardJNIBridgeTest, EdgeCases) {
    // Test empty URL
    EXPECT_FALSE(filterEngine->shouldBlock(""));
    
    // Test invalid URLs
    EXPECT_FALSE(filterEngine->shouldBlock("not-a-url"));
    EXPECT_FALSE(filterEngine->shouldBlock("://invalid"));
    
    // Test very long URL
    std::string longUrl = "https://example.com/" + std::string(10000, 'a');
    EXPECT_FALSE(filterEngine->shouldBlock(longUrl)); // Should not crash
    
    // Test URL with special characters
    EXPECT_FALSE(filterEngine->shouldBlock("https://example.com/path?param=value&other=123#fragment"));
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}