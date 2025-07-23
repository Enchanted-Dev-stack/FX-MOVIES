package com.moview.adblocker;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = AdBlockerModule.NAME)
public class AdBlockerModule extends ReactContextBaseJavaModule {
    public static final String NAME = "AdBlocker";

    public AdBlockerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void init(ReadableMap options, Promise promise) {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            boolean success = manager.initialize(getReactApplicationContext());
            promise.resolve(success);
        } catch (Exception e) {
            promise.reject("INIT_ERROR", "Failed to initialize AdBlocker", e);
        }
    }

    @ReactMethod
    public void init(Promise promise) {
        // Overloaded method for backward compatibility (no options)
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            boolean success = manager.initialize(getReactApplicationContext());
            promise.resolve(success);
        } catch (Exception e) {
            promise.reject("INIT_ERROR", "Failed to initialize AdBlocker", e);
        }
    }

    @ReactMethod
    public void enable(Promise promise) {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            manager.enable();
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("ENABLE_ERROR", "Failed to enable AdBlocker", e);
        }
    }

    @ReactMethod
    public void disable(Promise promise) {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            manager.disable();
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("DISABLE_ERROR", "Failed to disable AdBlocker", e);
        }
    }

    @ReactMethod
    public void filterRequest(String url, Promise promise) {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            boolean shouldBlock = manager.shouldBlock(url);
            promise.resolve(shouldBlock);
        } catch (Exception e) {
            promise.reject("FILTER_ERROR", "Failed to filter request", e);
        }
    }

    @ReactMethod
    public void isEnabled(Promise promise) {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            boolean enabled = manager.isEnabled();
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", "Failed to get AdBlocker status", e);
        }
    }

    @ReactMethod
    public void updateFilters(Promise promise) {
        try {
            AdBlockerManager manager = AdBlockerManager.getInstance();
            boolean success = manager.updateFilters();
            promise.resolve(success);
        } catch (Exception e) {
            promise.reject("UPDATE_ERROR", "Failed to update filters", e);
        }
    }
}