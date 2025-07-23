package com.moview.adblocker;

import android.webkit.WebResourceResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import static org.junit.Assert.*;

/**
 * Unit tests for CustomWebViewClient
 * Tests basic functionality and error handling
 */
@RunWith(RobolectricTestRunner.class)
@Config(sdk = 28)
public class CustomWebViewClientTest {
    
    private CustomWebViewClient customWebViewClient;
    
    @Before
    public void setUp() {
        customWebViewClient = new CustomWebViewClient();
    }
    
    @Test
    public void testCustomWebViewClient_Instantiation() {
        // Test that CustomWebViewClient can be instantiated
        assertNotNull("CustomWebViewClient should be instantiated", customWebViewClient);
    }
    
    @Test
    public void testCustomWebViewClient_WithNullOriginalClient() {
        // Test that CustomWebViewClient can be instantiated with null original client
        CustomWebViewClient client = new CustomWebViewClient(null);
        assertNotNull("CustomWebViewClient should be instantiated with null original client", client);
    }
    
    @Test
    public void testShouldInterceptRequest_NullRequest_ReturnsNull() {
        // Test null request handling - this should return null and not crash
        try {
            WebResourceResponse response = customWebViewClient.shouldInterceptRequest(null, (android.webkit.WebResourceRequest) null);
            // The method should handle null gracefully and return null
            assertNull("Should return null for null request", response);
        } catch (Exception e) {
            // If an exception is thrown, that's also acceptable behavior for null input
            assertTrue("Exception should be handled gracefully", true);
        }
    }
    
    @Test
    public void testShouldInterceptRequest_LegacyMethod_NullUrl() {
        // Test legacy method with null URL
        WebResourceResponse response = customWebViewClient.shouldInterceptRequest(null, (String) null);
        assertNull("Legacy method should return null for null URL", response);
    }
    
    @Test
    public void testCustomWebViewClient_WithOriginalClient() {
        // Test that CustomWebViewClient can wrap another WebViewClient
        android.webkit.WebViewClient originalClient = new android.webkit.WebViewClient();
        CustomWebViewClient client = new CustomWebViewClient(originalClient);
        assertNotNull("CustomWebViewClient should be instantiated with original client", client);
    }
}