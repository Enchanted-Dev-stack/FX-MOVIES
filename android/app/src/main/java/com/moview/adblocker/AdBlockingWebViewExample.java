package com.moview.adblocker;

import android.content.Context;
import android.webkit.WebView;
import android.webkit.WebSettings;

/**
 * Example class showing how to integrate CustomWebViewClient with WebView
 * This demonstrates the proper setup for ad blocking in WebViews
 */
public class AdBlockingWebViewExample {
    
    /**
     * Creates a WebView with ad blocking enabled
     * @param context Android context
     * @return Configured WebView with ad blocking
     */
    public static WebView createAdBlockingWebView(Context context) {
        WebView webView = new WebView(context);
        
        // Initialize AdBlocker if not already done
        AdBlockerManager adBlockerManager = AdBlockerManager.getInstance();
        if (!adBlockerManager.isEnabled()) {
            adBlockerManager.initialize();
            adBlockerManager.enable();
        }
        
        // Set up the custom WebViewClient for ad blocking
        CustomWebViewClient adBlockingClient = new CustomWebViewClient();
        webView.setWebViewClient(adBlockingClient);
        
        // Configure WebView settings
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        
        // Enable mixed content for HTTPS sites with HTTP resources
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        
        return webView;
    }
    
    /**
     * Creates a WebView with ad blocking that wraps an existing WebViewClient
     * @param context Android context
     * @param existingClient Existing WebViewClient to wrap
     * @return Configured WebView with ad blocking
     */
    public static WebView createAdBlockingWebView(Context context, android.webkit.WebViewClient existingClient) {
        WebView webView = new WebView(context);
        
        // Initialize AdBlocker if not already done
        AdBlockerManager adBlockerManager = AdBlockerManager.getInstance();
        if (!adBlockerManager.isEnabled()) {
            adBlockerManager.initialize();
            adBlockerManager.enable();
        }
        
        // Set up the custom WebViewClient that wraps the existing client
        CustomWebViewClient adBlockingClient = new CustomWebViewClient(existingClient);
        webView.setWebViewClient(adBlockingClient);
        
        // Configure WebView settings
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        
        return webView;
    }
    
    /**
     * Example of how to use the ad blocking WebView
     */
    public static void exampleUsage(Context context) {
        // Create ad blocking WebView
        WebView webView = createAdBlockingWebView(context);
        
        // Load a webpage - ads will be automatically blocked
        webView.loadUrl("https://example.com");
        
        // The CustomWebViewClient will intercept all network requests
        // and block those that match ad/tracker patterns
    }
    
    /**
     * Example of how to temporarily disable ad blocking for a specific WebView
     */
    public static WebView createWebViewWithoutAdBlocking(Context context) {
        WebView webView = new WebView(context);
        
        // Temporarily disable ad blocking
        AdBlockerManager adBlockerManager = AdBlockerManager.getInstance();
        adBlockerManager.disable();
        
        // Use standard WebViewClient (no ad blocking)
        webView.setWebViewClient(new android.webkit.WebViewClient());
        
        // Configure WebView settings
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        
        return webView;
    }
}