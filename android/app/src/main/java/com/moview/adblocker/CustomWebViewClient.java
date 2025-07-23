package com.moview.adblocker;

import android.graphics.Bitmap;
import android.net.Uri;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom WebViewClient that intercepts network requests for ad blocking
 * Extends WebViewClient to provide comprehensive request filtering
 * Handles main pages, iframes, AJAX requests, and other resource types
 */
public class CustomWebViewClient extends WebViewClient {
    private static final String TAG = "CustomWebViewClient";
    
    // MIME types for blocked responses
    private static final String BLOCKED_MIME_TYPE = "text/plain";
    private static final String BLOCKED_ENCODING = "utf-8";
    private static final String BLOCKED_CONTENT = "";
    
    // Resource type constants for filtering
    private static final String RESOURCE_TYPE_MAIN_FRAME = "main_frame";
    private static final String RESOURCE_TYPE_SUB_FRAME = "sub_frame";
    private static final String RESOURCE_TYPE_STYLESHEET = "stylesheet";
    private static final String RESOURCE_TYPE_SCRIPT = "script";
    private static final String RESOURCE_TYPE_IMAGE = "image";
    private static final String RESOURCE_TYPE_XMLHTTPREQUEST = "xmlhttprequest";
    
    private final AdBlockerManager adBlockerManager;
    private final WebViewClient originalClient;
    
    /**
     * Constructor with default AdBlockerManager
     */
    public CustomWebViewClient() {
        this(null);
    }
    
    /**
     * Constructor that wraps an existing WebViewClient
     * @param originalClient The original WebViewClient to wrap (can be null)
     */
    public CustomWebViewClient(WebViewClient originalClient) {
        this.adBlockerManager = AdBlockerManager.getInstance();
        this.originalClient = originalClient;
        Log.d(TAG, "CustomWebViewClient initialized");
    }
    
    /**
     * Intercept all network requests for ad blocking
     * This is the main entry point for request filtering
     */
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request == null || request.getUrl() == null) {
            Log.w(TAG, "Received null request or URL, allowing through");
            return callOriginalShouldInterceptRequest(view, request);
        }
        
        String url = request.getUrl().toString();
        String method = request.getMethod();
        Map<String, String> headers = request.getRequestHeaders();
        
        Log.d(TAG, "Intercepting request: " + method + " " + url);
        
        try {
            // Check if ad blocking is enabled and URL should be blocked
            if (adBlockerManager.isEnabled() && shouldBlockRequest(url, request)) {
                Log.i(TAG, "Blocking request: " + url);
                return createBlockedResponse();
            }
            
            Log.d(TAG, "Allowing request: " + url);
            return callOriginalShouldInterceptRequest(view, request);
            
        } catch (Exception e) {
            Log.e(TAG, "Error processing request: " + url, e);
            // On error, default to allowing the request
            return callOriginalShouldInterceptRequest(view, request);
        }
    }
    
    /**
     * Legacy method for API compatibility (API < 21)
     * Delegates to the main shouldInterceptRequest method
     */
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        if (url == null) {
            Log.w(TAG, "Received null URL in legacy method, allowing through");
            return callOriginalShouldInterceptRequest(view, url);
        }
        
        Log.d(TAG, "Legacy intercepting request: " + url);
        
        try {
            // Check if ad blocking is enabled and URL should be blocked
            if (adBlockerManager.isEnabled() && shouldBlockUrl(url)) {
                Log.i(TAG, "Blocking legacy request: " + url);
                return createBlockedResponse();
            }
            
            Log.d(TAG, "Allowing legacy request: " + url);
            return callOriginalShouldInterceptRequest(view, url);
            
        } catch (Exception e) {
            Log.e(TAG, "Error processing legacy request: " + url, e);
            // On error, default to allowing the request
            return callOriginalShouldInterceptRequest(view, url);
        }
    }
    
    /**
     * Determine if a request should be blocked based on URL and request details
     * Handles different resource types: main pages, iframes, AJAX, etc.
     */
    private boolean shouldBlockRequest(String url, WebResourceRequest request) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        // Get resource type from request headers or URL analysis
        String resourceType = determineResourceType(url, request);
        Log.d(TAG, "Resource type for " + url + ": " + resourceType);
        
        // Apply filtering based on resource type
        switch (resourceType) {
            case RESOURCE_TYPE_MAIN_FRAME:
                // Main page requests - be more conservative
                return shouldBlockMainFrame(url);
                
            case RESOURCE_TYPE_SUB_FRAME:
                // Iframe requests - apply standard filtering
                return shouldBlockSubFrame(url);
                
            case RESOURCE_TYPE_SCRIPT:
                // JavaScript requests - aggressive filtering for ad scripts
                return shouldBlockScript(url);
                
            case RESOURCE_TYPE_STYLESHEET:
                // CSS requests - filter ad-related stylesheets
                return shouldBlockStylesheet(url);
                
            case RESOURCE_TYPE_IMAGE:
                // Image requests - filter ad images and tracking pixels
                return shouldBlockImage(url);
                
            case RESOURCE_TYPE_XMLHTTPREQUEST:
                // AJAX requests - filter tracking and analytics calls
                return shouldBlockXHR(url);
                
            default:
                // Other resource types - apply general filtering
                return shouldBlockUrl(url);
        }
    }
    
    /**
     * Determine the resource type from URL and request details
     */
    private String determineResourceType(String url, WebResourceRequest request) {
        // Check Accept header for resource type hints
        Map<String, String> headers = request.getRequestHeaders();
        if (headers != null) {
            String accept = headers.get("Accept");
            if (accept != null) {
                if (accept.contains("text/html")) {
                    return RESOURCE_TYPE_MAIN_FRAME;
                } else if (accept.contains("text/css")) {
                    return RESOURCE_TYPE_STYLESHEET;
                } else if (accept.contains("application/javascript") || accept.contains("text/javascript")) {
                    return RESOURCE_TYPE_SCRIPT;
                } else if (accept.contains("image/")) {
                    return RESOURCE_TYPE_IMAGE;
                }
            }
            
            // Check for AJAX requests
            String requestedWith = headers.get("X-Requested-With");
            if ("XMLHttpRequest".equals(requestedWith)) {
                return RESOURCE_TYPE_XMLHTTPREQUEST;
            }
        }
        
        // Fallback to URL-based detection
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.endsWith(".css")) {
            return RESOURCE_TYPE_STYLESHEET;
        } else if (lowerUrl.endsWith(".js") || lowerUrl.contains("javascript")) {
            return RESOURCE_TYPE_SCRIPT;
        } else if (lowerUrl.matches(".*\\.(jpg|jpeg|png|gif|webp|svg).*")) {
            return RESOURCE_TYPE_IMAGE;
        } else if (lowerUrl.contains("ajax") || lowerUrl.contains("api/")) {
            return RESOURCE_TYPE_XMLHTTPREQUEST;
        }
        
        return RESOURCE_TYPE_MAIN_FRAME; // Default assumption
    }
    
    /**
     * Filter main frame requests (main pages)
     * More conservative filtering to avoid breaking navigation
     */
    private boolean shouldBlockMainFrame(String url) {
        // Only block obviously malicious main frame requests
        return shouldBlockUrl(url) && isObviouslyMalicious(url);
    }
    
    /**
     * Filter sub-frame requests (iframes)
     * Standard filtering applies
     */
    private boolean shouldBlockSubFrame(String url) {
        return shouldBlockUrl(url);
    }
    
    /**
     * Filter script requests with aggressive ad script detection
     */
    private boolean shouldBlockScript(String url) {
        // Check for common ad script patterns
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.contains("ads") || 
            lowerUrl.contains("analytics") || 
            lowerUrl.contains("tracking") ||
            lowerUrl.contains("doubleclick") ||
            lowerUrl.contains("googletagmanager") ||
            lowerUrl.contains("facebook.com/tr") ||
            lowerUrl.contains("google-analytics")) {
            return true;
        }
        
        return shouldBlockUrl(url);
    }
    
    /**
     * Filter stylesheet requests
     */
    private boolean shouldBlockStylesheet(String url) {
        return shouldBlockUrl(url);
    }
    
    /**
     * Filter image requests with tracking pixel detection
     */
    private boolean shouldBlockImage(String url) {
        // Check for tracking pixels (1x1 images)
        if (url.contains("1x1") || url.contains("pixel") || url.contains("beacon")) {
            return true;
        }
        
        return shouldBlockUrl(url);
    }
    
    /**
     * Filter AJAX/XHR requests with analytics detection
     */
    private boolean shouldBlockXHR(String url) {
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.contains("analytics") || 
            lowerUrl.contains("tracking") ||
            lowerUrl.contains("metrics") ||
            lowerUrl.contains("telemetry") ||
            lowerUrl.contains("collect")) {
            return true;
        }
        
        return shouldBlockUrl(url);
    }
    
    /**
     * Basic URL filtering using AdBlockerManager
     */
    private boolean shouldBlockUrl(String url) {
        return adBlockerManager.shouldBlock(url);
    }
    
    /**
     * Check if URL is obviously malicious (for main frame filtering)
     */
    private boolean isObviouslyMalicious(String url) {
        String lowerUrl = url.toLowerCase();
        return lowerUrl.contains("malware") || 
               lowerUrl.contains("phishing") || 
               lowerUrl.contains("scam") ||
               lowerUrl.contains("popup");
    }
    
    /**
     * Create a blocked response for intercepted requests
     */
    private WebResourceResponse createBlockedResponse() {
        try {
            // Create empty response with appropriate headers
            Map<String, String> responseHeaders = new HashMap<>();
            responseHeaders.put("Access-Control-Allow-Origin", "*");
            responseHeaders.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            responseHeaders.put("Access-Control-Allow-Headers", "*");
            
            return new WebResourceResponse(
                BLOCKED_MIME_TYPE,
                BLOCKED_ENCODING,
                200, // HTTP 200 to avoid error pages
                "OK",
                responseHeaders,
                new ByteArrayInputStream(BLOCKED_CONTENT.getBytes())
            );
        } catch (Exception e) {
            Log.e(TAG, "Error creating blocked response", e);
            // Fallback to simple blocked response
            return new WebResourceResponse(
                BLOCKED_MIME_TYPE,
                BLOCKED_ENCODING,
                new ByteArrayInputStream(BLOCKED_CONTENT.getBytes())
            );
        }
    }
    
    /**
     * Call the original WebViewClient's shouldInterceptRequest method if available
     */
    private WebResourceResponse callOriginalShouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (originalClient != null) {
            try {
                return originalClient.shouldInterceptRequest(view, request);
            } catch (Exception e) {
                Log.e(TAG, "Error calling original shouldInterceptRequest", e);
            }
        }
        return super.shouldInterceptRequest(view, request);
    }
    
    /**
     * Call the original WebViewClient's legacy shouldInterceptRequest method if available
     */
    private WebResourceResponse callOriginalShouldInterceptRequest(WebView view, String url) {
        if (originalClient != null) {
            try {
                return originalClient.shouldInterceptRequest(view, url);
            } catch (Exception e) {
                Log.e(TAG, "Error calling original legacy shouldInterceptRequest", e);
            }
        }
        return super.shouldInterceptRequest(view, url);
    }
    
    // Delegate other WebViewClient methods to original client if available
    
    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        Log.d(TAG, "Page started: " + url);
        if (originalClient != null) {
            originalClient.onPageStarted(view, url, favicon);
        } else {
            super.onPageStarted(view, url, favicon);
        }
    }
    
    @Override
    public void onPageFinished(WebView view, String url) {
        Log.d(TAG, "Page finished: " + url);
        if (originalClient != null) {
            originalClient.onPageFinished(view, url);
        } else {
            super.onPageFinished(view, url);
        }
    }
    
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        if (originalClient != null) {
            return originalClient.shouldOverrideUrlLoading(view, request);
        }
        return super.shouldOverrideUrlLoading(view, request);
    }
    
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (originalClient != null) {
            return originalClient.shouldOverrideUrlLoading(view, url);
        }
        return super.shouldOverrideUrlLoading(view, url);
    }
    
    @Override
    public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
        Log.w(TAG, "Received error for URL: " + failingUrl + ", Error: " + description);
        if (originalClient != null) {
            originalClient.onReceivedError(view, errorCode, description, failingUrl);
        } else {
            super.onReceivedError(view, errorCode, description, failingUrl);
        }
    }
}