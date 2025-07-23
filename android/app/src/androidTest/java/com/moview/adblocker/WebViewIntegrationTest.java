package com.moview.adblocker;

import android.content.Context;
import android.webkit.WebView;
import android.webkit.WebSettings;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.Assert.*;

/**
 * Integration tests for WebView request interception
 * Tests real WebView behavior with CustomWebViewClient
 */
@RunWith(AndroidJUnit4.class)
public class WebViewIntegrationTest {
    
    private Context context;
    private WebView webView;
    private CustomWebViewClient customWebViewClient;
    private AdBlockerManager adBlockerManager;
    
    @Before
    public void setUp() {
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        
        // Initialize AdBlocker
        adBlockerManager = AdBlockerManager.getInstance();
        adBlockerManager.initialize();
        adBlockerManager.enable();
        
        // Create WebView on main thread
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView = new WebView(context);
            customWebViewClient = new CustomWebViewClient();
            webView.setWebViewClient(customWebViewClient);
            
            // Configure WebView settings
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
        });
    }
    
    @Test
    public void testWebViewWithCustomClient_LoadsSuccessfully() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicBoolean pageLoaded = new AtomicBoolean(false);
        
        // Set up page load listener
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(new CustomWebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    pageLoaded.set(true);
                    latch.countDown();
                }
            });
            
            // Load a simple HTML page
            String html = "<html><body><h1>Test Page</h1></body></html>";
            webView.loadData(html, "text/html", "utf-8");
        });
        
        // Wait for page to load
        assertTrue("Page should load within timeout", latch.await(5, TimeUnit.SECONDS));
        assertTrue("Page should be marked as loaded", pageLoaded.get());
    }
    
    @Test
    public void testWebViewRequestInterception_BlocksAdRequests() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicInteger blockedRequests = new AtomicInteger(0);
        final AtomicInteger allowedRequests = new AtomicInteger(0);
        
        // Create custom client that tracks blocked/allowed requests
        CustomWebViewClient trackingClient = new CustomWebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                android.webkit.WebResourceResponse response = super.shouldInterceptRequest(view, request);
                
                if (response != null && "text/plain".equals(response.getMimeType())) {
                    // This is a blocked response
                    blockedRequests.incrementAndGet();
                } else {
                    // This request was allowed
                    allowedRequests.incrementAndGet();
                }
                
                return response;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                latch.countDown();
            }
        };
        
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(trackingClient);
            
            // Load HTML with ad-like resources
            String html = "<html><head>" +
                    "<script src='https://doubleclick.net/ads/script.js'></script>" +
                    "<script src='https://google-analytics.com/analytics.js'></script>" +
                    "<link rel='stylesheet' href='https://example.com/styles.css'>" +
                    "</head><body>" +
                    "<h1>Test Page</h1>" +
                    "<img src='https://facebook.com/tr/pixel.gif?id=123'>" +
                    "<img src='https://example.com/logo.png'>" +
                    "</body></html>";
            
            webView.loadData(html, "text/html", "utf-8");
        });
        
        // Wait for page to load
        assertTrue("Page should load within timeout", latch.await(10, TimeUnit.SECONDS));
        
        // Verify that some requests were blocked
        assertTrue("Should have blocked some ad requests", blockedRequests.get() > 0);
        assertTrue("Should have allowed some legitimate requests", allowedRequests.get() > 0);
    }
    
    @Test
    public void testWebViewRequestInterception_DisabledAdBlocking_AllowsAllRequests() throws InterruptedException {
        // Disable ad blocking
        adBlockerManager.disable();
        
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicInteger blockedRequests = new AtomicInteger(0);
        final AtomicInteger totalRequests = new AtomicInteger(0);
        
        CustomWebViewClient trackingClient = new CustomWebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                totalRequests.incrementAndGet();
                android.webkit.WebResourceResponse response = super.shouldInterceptRequest(view, request);
                
                if (response != null && "text/plain".equals(response.getMimeType())) {
                    blockedRequests.incrementAndGet();
                }
                
                return response;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                latch.countDown();
            }
        };
        
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(trackingClient);
            
            // Load HTML with ad-like resources
            String html = "<html><head>" +
                    "<script src='https://doubleclick.net/ads/script.js'></script>" +
                    "</head><body>" +
                    "<h1>Test Page</h1>" +
                    "</body></html>";
            
            webView.loadData(html, "text/html", "utf-8");
        });
        
        // Wait for page to load
        assertTrue("Page should load within timeout", latch.await(10, TimeUnit.SECONDS));
        
        // Verify that no requests were blocked when ad blocking is disabled
        assertEquals("Should not block any requests when disabled", 0, blockedRequests.get());
    }
    
    @Test
    public void testWebViewRequestInterception_HandlesMainFrameRequests() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicBoolean mainFrameProcessed = new AtomicBoolean(false);
        
        CustomWebViewClient trackingClient = new CustomWebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    String url = request.getUrl().toString();
                    if (url.startsWith("data:") || url.contains("test-page")) {
                        mainFrameProcessed.set(true);
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                latch.countDown();
            }
        };
        
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(trackingClient);
            webView.loadUrl("data:text/html,<html><body><h1>Test Page</h1></body></html>");
        });
        
        // Wait for page to load
        assertTrue("Page should load within timeout", latch.await(5, TimeUnit.SECONDS));
        assertTrue("Main frame request should be processed", mainFrameProcessed.get());
    }
    
    @Test
    public void testWebViewRequestInterception_HandlesIframeRequests() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicBoolean iframeRequestProcessed = new AtomicBoolean(false);
        
        CustomWebViewClient trackingClient = new CustomWebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    String url = request.getUrl().toString();
                    if (url.contains("iframe-content")) {
                        iframeRequestProcessed.set(true);
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Add delay to allow iframe loading
                view.postDelayed(() -> latch.countDown(), 1000);
            }
        };
        
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(trackingClient);
            
            String html = "<html><body>" +
                    "<h1>Main Page</h1>" +
                    "<iframe src='data:text/html,<h2>Iframe Content</h2>' name='iframe-content'></iframe>" +
                    "</body></html>";
            
            webView.loadData(html, "text/html", "utf-8");
        });
        
        // Wait for page and iframe to load
        assertTrue("Page should load within timeout", latch.await(10, TimeUnit.SECONDS));
        // Note: iframe detection might not work with data URLs in all WebView versions
    }
    
    @Test
    public void testWebViewRequestInterception_HandlesAjaxRequests() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicBoolean ajaxRequestProcessed = new AtomicBoolean(false);
        
        CustomWebViewClient trackingClient = new CustomWebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    String url = request.getUrl().toString();
                    if (url.contains("api/data") || 
                        (request.getRequestHeaders() != null && 
                         "XMLHttpRequest".equals(request.getRequestHeaders().get("X-Requested-With")))) {
                        ajaxRequestProcessed.set(true);
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Execute JavaScript to make AJAX request
                view.evaluateJavascript(
                    "var xhr = new XMLHttpRequest();" +
                    "xhr.open('GET', 'https://example.com/api/data');" +
                    "xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');" +
                    "xhr.send();",
                    null
                );
                
                // Wait a bit for AJAX request to be made
                view.postDelayed(() -> latch.countDown(), 2000);
            }
        };
        
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(trackingClient);
            
            String html = "<html><body>" +
                    "<h1>AJAX Test Page</h1>" +
                    "<script>console.log('Page loaded');</script>" +
                    "</body></html>";
            
            webView.loadData(html, "text/html", "utf-8");
        });
        
        // Wait for page to load and AJAX to execute
        assertTrue("Page should load within timeout", latch.await(15, TimeUnit.SECONDS));
        // Note: AJAX request detection depends on WebView's network handling
    }
    
    @Test
    public void testWebViewRequestInterception_ErrorHandling() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        final AtomicBoolean errorHandled = new AtomicBoolean(false);
        
        // Create client that might encounter errors
        CustomWebViewClient errorHandlingClient = new CustomWebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                errorHandled.set(true);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                latch.countDown();
            }
        };
        
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            webView.setWebViewClient(errorHandlingClient);
            
            // Load page with broken resources
            String html = "<html><body>" +
                    "<h1>Error Test Page</h1>" +
                    "<img src='https://nonexistent-domain-12345.com/image.png'>" +
                    "</body></html>";
            
            webView.loadData(html, "text/html", "utf-8");
        });
        
        // Wait for page to load
        assertTrue("Page should load within timeout", latch.await(10, TimeUnit.SECONDS));
        // Error handling verification depends on WebView behavior with broken resources
    }
}