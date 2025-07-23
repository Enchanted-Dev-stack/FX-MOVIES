package com.moview.adblocker;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

/**
 * Simple test activity to verify AdBlocker functionality
 * This can be used for manual testing of the native integration
 */
public class AdBlockerTestActivity extends Activity {
    private static final String TAG = "AdBlockerTest";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.i(TAG, "Starting AdBlocker integration test");
        
        // Test AdBlocker functionality
        testAdBlockerIntegration();
    }
    
    private void testAdBlockerIntegration() {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            
            // Test initialization
            Log.i(TAG, "Testing initialization...");
            boolean initResult = manager.initialize();
            Log.i(TAG, "Initialization result: " + initResult);
            
            if (initResult) {
                // Test enable/disable
                Log.i(TAG, "Testing enable/disable...");
                manager.enable();
                Log.i(TAG, "Enabled: " + manager.isEnabled());
                
                // Test URL filtering
                Log.i(TAG, "Testing URL filtering...");
                String[] testUrls = {
                    "https://doubleclick.net/ads/script.js",
                    "https://example.com/content/article.html",
                    "https://googleadservices.com/pagead/ads",
                    "https://github.com/user/repo"
                };
                
                for (String url : testUrls) {
                    boolean shouldBlock = manager.shouldBlock(url);
                    Log.i(TAG, "URL: " + url + " -> Block: " + shouldBlock);
                }
                
                // Test filter updates
                Log.i(TAG, "Testing filter updates...");
                boolean updateResult = manager.updateFilters();
                Log.i(TAG, "Filter update result: " + updateResult);
                
                Log.i(TAG, "AdBlocker integration test completed successfully");
            } else {
                Log.w(TAG, "AdBlocker initialization failed");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "AdBlocker integration test failed", e);
        }
    }
}