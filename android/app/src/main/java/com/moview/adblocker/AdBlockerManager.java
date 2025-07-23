package com.moview.adblocker;

import android.content.Context;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okio.BufferedSource;
import okio.Okio;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Core filtering logic manager for AdBlocker
 * Integrates with actual AdGuard filter lists and native filtering engine
 * Thread-safe singleton implementation
 */
public class AdBlockerManager {
    private static final String TAG = "AdBlockerManager";
    private static volatile AdBlockerManager instance;
    private volatile boolean isInitialized = false;
    private volatile boolean isEnabled = false;
    private final Object lock = new Object();
    
    // AdGuard filter list URLs
    private static final String[] FILTER_LIST_URLS = {
        "https://filters.adtidy.org/extension/chromium/filters/2.txt", // AdGuard Base Filter
        "https://easylist.to/easylist/easylist.txt", // EasyList
        "https://easylist.to/easylist/easyprivacy.txt", // EasyPrivacy
        "https://filters.adtidy.org/extension/chromium/filters/3.txt", // AdGuard Tracking Protection
        "https://filters.adtidy.org/extension/chromium/filters/14.txt" // AdGuard Annoyances
    };
    
    // Components for filter management
    private Context applicationContext;
    private ExecutorService executorService;
    private OkHttpClient httpClient;
    private File filterCacheDir;

    private AdBlockerManager() {
        // Private constructor for singleton
        executorService = Executors.newCachedThreadPool();
    }

    public static AdBlockerManager getInstance() {
        if (instance == null) {
            synchronized (AdBlockerManager.class) {
                if (instance == null) {
                    instance = new AdBlockerManager();
                }
            }
        }
        return instance;
    }

    /**
     * Initialize the AdGuard filter integration
     * @param context Application context
     * @return true if initialization successful
     */
    public boolean initialize(Context context) {
        synchronized (lock) {
            if (isInitialized) {
                Log.d(TAG, "AdBlocker already initialized");
                return true;
            }
            
            try {
                Log.d(TAG, "Initializing AdGuard filter integration");
                
                // Store application context
                this.applicationContext = context.getApplicationContext();
                
                // Initialize HTTP client for filter downloads
                httpClient = new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(60, TimeUnit.SECONDS)
                    .build();
                
                // Create filter cache directory
                filterCacheDir = new File(applicationContext.getCacheDir(), "adguard_filters");
                if (!filterCacheDir.exists()) {
                    filterCacheDir.mkdirs();
                }
                
                // Initialize native filtering engine
                if (!nativeInit()) {
                    Log.e(TAG, "Failed to initialize native filtering engine");
                    return false;
                }
                
                // Load default filter lists
                loadDefaultFilterLists();
                
                isInitialized = true;
                Log.i(TAG, "AdGuard filter integration initialized successfully");
                return true;
            } catch (Exception e) {
                Log.e(TAG, "Failed to initialize AdGuard filter integration", e);
                return false;
            }
        }
    }

    /**
     * Initialize with legacy method signature for backward compatibility
     * @return true if initialization successful
     */
    public boolean initialize() {
        Log.w(TAG, "initialize() called without context - this method is deprecated");
        return false;
    }

    /**
     * Enable ad blocking functionality
     */
    public void enable() {
        synchronized (lock) {
            if (!isInitialized) {
                Log.w(TAG, "AdBlocker not initialized, cannot enable");
                return;
            }
            isEnabled = true;
            Log.d(TAG, "AdBlocker enabled");
        }
    }

    /**
     * Disable ad blocking functionality
     */
    public void disable() {
        synchronized (lock) {
            isEnabled = false;
            Log.d(TAG, "AdBlocker disabled");
        }
    }

    /**
     * Check if a URL should be blocked
     * @param url The URL to check
     * @return true if the URL should be blocked
     */
    public boolean shouldBlock(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        // Read volatile fields once to ensure consistency
        boolean initialized = isInitialized;
        boolean enabled = isEnabled;
        
        if (!initialized || !enabled) {
            return false;
        }

        try {
            Log.d(TAG, "Filtering URL: " + url);
            return nativeFilterUrl(url);
        } catch (Exception e) {
            Log.e(TAG, "Error filtering URL: " + url, e);
            return false; // Default to allow on error
        }
    }

    /**
     * Check if a WebResourceRequest should be blocked
     * @param request The WebResourceRequest to check
     * @return true if the request should be blocked
     */
    public boolean shouldBlock(WebResourceRequest request) {
        if (request == null || request.getUrl() == null) {
            return false;
        }

        // Read volatile fields once to ensure consistency
        boolean initialized = isInitialized;
        boolean enabled = isEnabled;
        
        if (!initialized || !enabled) {
            return false;
        }

        try {
            String url = request.getUrl().toString();
            Log.d(TAG, "Filtering WebResourceRequest: " + url);
            
            // Use native filtering engine to check the request
            return nativeFilterUrl(url);
        } catch (Exception e) {
            Log.e(TAG, "Error filtering WebResourceRequest: " + request.getUrl(), e);
            return false; // Default to allow on error
        }
    }

    /**
     * Get a blocked response for intercepted requests
     * @return Empty WebResourceResponse to block the request
     */
    public WebResourceResponse getBlockedResponse() {
        return new WebResourceResponse("text/plain", "utf-8", 
            new ByteArrayInputStream("".getBytes()));
    }

    /**
     * Load default filter lists (EasyList, EasyPrivacy, AdGuard Base filters)
     */
    private void loadDefaultFilterLists() {
        try {
            Log.d(TAG, "Loading default filter lists");
            
            // Download and load filter lists asynchronously
            CompletableFuture.runAsync(() -> {
                for (String filterUrl : FILTER_LIST_URLS) {
                    try {
                        downloadAndLoadFilterList(filterUrl);
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to load filter list: " + filterUrl, e);
                    }
                }
            }, executorService);
            
            Log.i(TAG, "Default filter lists loading initiated");
        } catch (Exception e) {
            Log.e(TAG, "Failed to initiate filter list loading", e);
        }
    }

    /**
     * Download and load a filter list from URL
     * @param filterUrl URL of the filter list
     */
    private void downloadAndLoadFilterList(String filterUrl) throws IOException {
        Log.d(TAG, "Downloading filter list: " + filterUrl);
        
        // Create cache file name from URL
        String fileName = filterUrl.substring(filterUrl.lastIndexOf('/') + 1);
        if (!fileName.contains(".")) {
            fileName += ".txt";
        }
        File cacheFile = new File(filterCacheDir, fileName);
        
        // Check if cached version exists and is recent (less than 24 hours old)
        if (cacheFile.exists() && (System.currentTimeMillis() - cacheFile.lastModified()) < 24 * 60 * 60 * 1000) {
            Log.d(TAG, "Using cached filter list: " + fileName);
            loadFilterListFromFile(cacheFile);
            return;
        }
        
        // Download fresh filter list
        Request request = new Request.Builder()
            .url(filterUrl)
            .build();
            
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to download filter list: " + response.code());
            }
            
            // Save to cache file
            try (FileOutputStream fos = new FileOutputStream(cacheFile);
                 BufferedSource source = response.body().source()) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = source.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
            
            Log.d(TAG, "Downloaded and cached filter list: " + fileName);
            loadFilterListFromFile(cacheFile);
        }
    }

    /**
     * Load filter rules from a file into the native filtering engine
     * @param filterFile File containing filter rules
     */
    private void loadFilterListFromFile(File filterFile) throws IOException {
        Log.d(TAG, "Loading filter rules from file: " + filterFile.getName());
        
        StringBuilder filterContent = new StringBuilder();
        try (FileInputStream fis = new FileInputStream(filterFile)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                filterContent.append(new String(buffer, 0, bytesRead, "UTF-8"));
            }
        }
        
        // Load filter content into native filtering engine
        if (!nativeLoadFilterRules(filterContent.toString())) {
            Log.w(TAG, "Failed to load filter rules from: " + filterFile.getName());
        } else {
            Log.d(TAG, "Successfully loaded filter rules from: " + filterFile.getName());
        }
    }

    // Native method declarations
    private native boolean nativeInit();
    private native boolean nativeFilterUrl(String url);
    private native boolean nativeLoadFilterRules(String filterContent);
    private native boolean nativeClearFilters();
    private native void nativeCleanup();
    private native String nativeNormalizeUrl(String url);
    private native String nativeExtractDomain(String url);

    static {
        try {
            System.loadLibrary("adblocker");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "Failed to load native library", e);
        }
    }

    /**
     * Check if ad blocking is currently enabled
     * @return true if enabled
     */
    public boolean isEnabled() {
        return isEnabled && isInitialized;
    }

    /**
     * Update filter lists
     * @return true if update successful
     */
    public boolean updateFilters() {
        synchronized (lock) {
            if (!isInitialized) {
                Log.w(TAG, "AdBlocker not initialized, cannot update filters");
                return false;
            }

            try {
                Log.d(TAG, "Updating filter lists");
                
                // Update filter lists asynchronously
                CompletableFuture<Boolean> updateFuture = CompletableFuture.supplyAsync(() -> {
                    try {
                        // Clear existing filters in native engine
                        nativeClearFilters();
                        
                        // Re-download and load all filter lists
                        for (String filterUrl : FILTER_LIST_URLS) {
                            try {
                                // Force fresh download by deleting cache
                                String fileName = filterUrl.substring(filterUrl.lastIndexOf('/') + 1);
                                if (!fileName.contains(".")) {
                                    fileName += ".txt";
                                }
                                File cacheFile = new File(filterCacheDir, fileName);
                                if (cacheFile.exists()) {
                                    cacheFile.delete();
                                }
                                
                                downloadAndLoadFilterList(filterUrl);
                            } catch (Exception e) {
                                Log.e(TAG, "Failed to update filter list: " + filterUrl, e);
                            }
                        }
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error during filter update", e);
                        return false;
                    }
                }, executorService);
                
                // Wait for update to complete (with timeout)
                boolean success = updateFuture.get(120, TimeUnit.SECONDS);
                if (success) {
                    Log.i(TAG, "Filter lists updated successfully");
                } else {
                    Log.w(TAG, "Filter list update failed");
                }
                return success;
            } catch (Exception e) {
                Log.e(TAG, "Failed to update filters", e);
                return false;
            }
        }
    }

    /**
     * Cleanup AdBlocker resources
     * Should be called when the app is being destroyed
     */
    public void cleanup() {
        synchronized (lock) {
            if (!isInitialized) {
                return;
            }
            
            try {
                Log.d(TAG, "Cleaning up AdBlocker resources");
                
                // Cleanup native filtering engine
                nativeCleanup();
                
                // Shutdown HTTP client
                if (httpClient != null) {
                    httpClient.dispatcher().executorService().shutdown();
                    httpClient.connectionPool().evictAll();
                }
                
                // Shutdown executor service
                if (executorService != null && !executorService.isShutdown()) {
                    executorService.shutdown();
                    try {
                        if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                            executorService.shutdownNow();
                        }
                    } catch (InterruptedException e) {
                        executorService.shutdownNow();
                        Thread.currentThread().interrupt();
                    }
                }
                
                isEnabled = false;
                isInitialized = false;
                applicationContext = null;
                httpClient = null;
                filterCacheDir = null;
                
                Log.i(TAG, "AdBlocker cleanup completed");
            } catch (Exception e) {
                Log.e(TAG, "Error during AdBlocker cleanup", e);
                // Force cleanup state even on error
                isEnabled = false;
                isInitialized = false;
            }
        }
    }
}