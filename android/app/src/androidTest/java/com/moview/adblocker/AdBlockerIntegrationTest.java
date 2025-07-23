package com.moview.adblocker;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import android.content.Context;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.junit.Assert.*;

/**
 * Integration tests for AdBlocker functionality
 * These tests run on an Android device/emulator with the native library loaded
 */
@RunWith(AndroidJUnit4.class)
public class AdBlockerIntegrationTest {

    private AdBlockerManager adBlockerManager;
    private Context context;

    @Before
    public void setUp() {
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        adBlockerManager = AdBlockerManager.getInstance();
        
        // Initialize the AdBlocker for integration tests
        boolean initResult = adBlockerManager.initialize();
        assertTrue("AdBlocker should initialize successfully", initResult);
        
        // Enable ad blocking
        adBlockerManager.enable();
        assertTrue("AdBlocker should be enabled", adBlockerManager.isEnabled());
    }

    @Test
    public void testBasicAdBlocking() {
        // Test URLs that should be blocked
        String[] blockedUrls = {
            "https://doubleclick.net/ads/script.js",
            "https://googleadservices.com/pagead/ads",
            "https://googlesyndication.com/safeframe/ads",
            "https://googletagmanager.com/gtm.js",
            "https://google-analytics.com/analytics.js",
            "https://facebook.com/tr?id=123456",
            "https://connect.facebook.net/en_US/fbevents.js",
            "https://example.com/ads/banner.jpg",
            "https://example.com/advertisement/popup.html",
            "https://tracker.example.com/pixel.gif"
        };

        for (String url : blockedUrls) {
            boolean shouldBlock = adBlockerManager.shouldBlock(url);
            assertTrue("URL should be blocked: " + url, shouldBlock);
        }
    }

    @Test
    public void testLegitimateContentNotBlocked() {
        // Test URLs that should NOT be blocked
        String[] allowedUrls = {
            "https://example.com/content/article.html",
            "https://google.com/search?q=test",
            "https://github.com/user/repo",
            "https://stackoverflow.com/questions/123",
            "https://developer.mozilla.org/en-US/docs/Web",
            "https://reactnative.dev/docs/getting-started",
            "https://news.ycombinator.com/",
            "https://medium.com/@author/article"
        };

        for (String url : allowedUrls) {
            boolean shouldBlock = adBlockerManager.shouldBlock(url);
            assertFalse("URL should NOT be blocked: " + url, shouldBlock);
        }
    }

    @Test
    public void testDomainBasedBlocking() {
        // Test that domain-based rules work correctly
        String[] doubleClickUrls = {
            "https://doubleclick.net/",
            "https://doubleclick.net/ads/",
            "https://doubleclick.net/path/to/resource.js",
            "http://doubleclick.net/different/path"
        };

        for (String url : doubleClickUrls) {
            boolean shouldBlock = adBlockerManager.shouldBlock(url);
            assertTrue("DoubleClick URL should be blocked: " + url, shouldBlock);
        }
    }

    @Test
    public void testPathBasedBlocking() {
        // Test that path-based rules work correctly
        String[] adsPathUrls = {
            "https://example.com/ads/banner.png",
            "https://different.com/ads/video.mp4",
            "https://site.org/ads/script.js",
            "https://test.net/advertisement/popup.html"
        };

        for (String url : adsPathUrls) {
            boolean shouldBlock = adBlockerManager.shouldBlock(url);
            assertTrue("Ads path URL should be blocked: " + url, shouldBlock);
        }
    }

    @Test
    public void testCaseInsensitiveMatching() {
        // Test that URL matching is case-insensitive
        String[][] urlPairs = {
            {"https://doubleclick.net/ads", "https://DOUBLECLICK.NET/ads"},
            {"https://GoogleAdServices.com/test", "https://googleadservices.com/test"},
            {"https://example.com/ADS/banner", "https://example.com/ads/banner"}
        };

        for (String[] pair : urlPairs) {
            boolean result1 = adBlockerManager.shouldBlock(pair[0]);
            boolean result2 = adBlockerManager.shouldBlock(pair[1]);
            assertEquals("Case variations should have same result: " + pair[0] + " vs " + pair[1], 
                        result1, result2);
        }
    }

    @Test
    public void testFilterUpdates() {
        // Get initial rule count (indirectly by testing known blocked URL)
        boolean initialBlocking = adBlockerManager.shouldBlock("https://doubleclick.net/test");
        assertTrue("Should block doubleclick initially", initialBlocking);

        // Update filters
        boolean updateResult = adBlockerManager.updateFilters();
        assertTrue("Filter update should succeed", updateResult);

        // Verify blocking still works after update
        boolean postUpdateBlocking = adBlockerManager.shouldBlock("https://doubleclick.net/test");
        assertTrue("Should still block doubleclick after update", postUpdateBlocking);
    }

    @Test
    public void testPerformanceWithManyUrls() {
        final int NUM_URLS = 1000;
        String[] testUrls = new String[NUM_URLS];
        
        // Generate test URLs
        for (int i = 0; i < NUM_URLS; i++) {
            if (i % 3 == 0) {
                testUrls[i] = "https://doubleclick.net/ads/" + i;
            } else if (i % 3 == 1) {
                testUrls[i] = "https://example.com/ads/banner" + i + ".jpg";
            } else {
                testUrls[i] = "https://content" + i + ".example.com/article.html";
            }
        }

        long startTime = System.currentTimeMillis();
        
        int blockedCount = 0;
        for (String url : testUrls) {
            if (adBlockerManager.shouldBlock(url)) {
                blockedCount++;
            }
        }
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Performance expectations
        assertTrue("Should complete filtering in reasonable time (< 5 seconds)", duration < 5000);
        assertTrue("Should block some URLs", blockedCount > 0);
        assertTrue("Should not block all URLs", blockedCount < NUM_URLS);
        
        // Log performance metrics
        double avgTimePerUrl = (double) duration / NUM_URLS;
        System.out.println("Filtered " + NUM_URLS + " URLs in " + duration + "ms");
        System.out.println("Average time per URL: " + avgTimePerUrl + "ms");
        System.out.println("Blocked " + blockedCount + " out of " + NUM_URLS + " URLs");
    }

    @Test
    public void testConcurrentFiltering() throws InterruptedException {
        final int NUM_THREADS = 5;
        final int URLS_PER_THREAD = 100;
        Thread[] threads = new Thread[NUM_THREADS];
        final int[] blockedCounts = new int[NUM_THREADS];
        final boolean[] threadSuccess = new boolean[NUM_THREADS];

        for (int t = 0; t < NUM_THREADS; t++) {
            final int threadIndex = t;
            threads[t] = new Thread(() -> {
                try {
                    int localBlocked = 0;
                    for (int i = 0; i < URLS_PER_THREAD; i++) {
                        String url;
                        if (i % 2 == 0) {
                            url = "https://doubleclick.net/thread" + threadIndex + "/url" + i;
                        } else {
                            url = "https://content" + threadIndex + "-" + i + ".example.com/page";
                        }
                        
                        if (adBlockerManager.shouldBlock(url)) {
                            localBlocked++;
                        }
                    }
                    blockedCounts[threadIndex] = localBlocked;
                    threadSuccess[threadIndex] = true;
                } catch (Exception e) {
                    threadSuccess[threadIndex] = false;
                }
            });
        }

        // Start all threads
        for (Thread thread : threads) {
            thread.start();
        }

        // Wait for completion
        for (Thread thread : threads) {
            thread.join(10000); // 10 second timeout
        }

        // Verify all threads completed successfully
        for (int i = 0; i < NUM_THREADS; i++) {
            assertTrue("Thread " + i + " should complete successfully", threadSuccess[i]);
            assertTrue("Thread " + i + " should block some URLs", blockedCounts[i] > 0);
        }
    }

    @Test
    public void testCleanupAndReinitialization() {
        // Verify initial state
        assertTrue("Should be enabled initially", adBlockerManager.isEnabled());
        assertTrue("Should block ads initially", 
                  adBlockerManager.shouldBlock("https://doubleclick.net/test"));

        // Cleanup
        adBlockerManager.cleanup();
        assertFalse("Should not be enabled after cleanup", adBlockerManager.isEnabled());

        // Reinitialize
        boolean reinitResult = adBlockerManager.initialize();
        assertTrue("Should reinitialize successfully", reinitResult);
        
        adBlockerManager.enable();
        assertTrue("Should be enabled after reinitialization", adBlockerManager.isEnabled());
        assertTrue("Should block ads after reinitialization", 
                  adBlockerManager.shouldBlock("https://doubleclick.net/test"));
    }
}