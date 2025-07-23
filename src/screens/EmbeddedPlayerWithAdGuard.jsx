import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Alert } from "react-native";
import WebView from "react-native-webview";
import Orientation from 'react-native-orientation-locker';
import AdBlocker from '../modules/AdBlocker'; // Import the AdGuard integration

export default function EmbeddedPlayer({ route }) {
    const { Id } = route.params;
    const [adBlockerReady, setAdBlockerReady] = useState(false);

    useEffect(() => {
        Orientation.lockToLandscape();
        StatusBar.setHidden(true, 'fade');
        console.log('📺 EmbeddedPlayer mounted');

        // Initialize AdGuard AdBlocker
        initializeAdBlocker();

        return () => {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false, 'fade');
        };
    }, []);

    const initializeAdBlocker = async () => {
        try {
            console.log('🛡️ Initializing AdGuard AdBlocker...');

            // Initialize the AdBlocker
            const success = await AdBlocker.init({
                enableLogging: true,
                performanceMode: 'balanced'
            });

            if (success) {
                // Enable ad blocking
                await AdBlocker.enable();
                const isEnabled = await AdBlocker.isEnabled();

                if (isEnabled) {
                    console.log('✅ AdGuard AdBlocker initialized and enabled!');
                    setAdBlockerReady(true);
                } else {
                    console.log('⚠️ AdBlocker initialized but not enabled');
                }
            } else {
                console.log('❌ Failed to initialize AdBlocker');
                // Fallback to your current JavaScript-based blocking
            }
        } catch (error) {
            console.error('❌ AdBlocker initialization error:', error);
            Alert.alert('AdBlocker Warning', 'Native ad blocking failed, using fallback protection');
            // Continue with your current JavaScript-based blocking
        }
    };

    // Enhanced navigation handler with AdGuard integration
    const handleNavigation = async ({ url }) => {
        console.log('🔍 Checking URL:', url);

        // First, check with AdGuard if available
        if (adBlockerReady) {
            try {
                const shouldBlock = await AdBlocker.filterRequest(url);
                if (shouldBlock) {
                    console.log('🛑 AdGuard blocked:', url);
                    return false;
                }
            } catch (error) {
                console.error('AdGuard filter error:', error);
            }
        }

        // Fallback to your existing domain blocking
        const adDomains = [
            "doubleclick.net", "googlesyndication.com",
            "adservice.google.com", "ads.yahoo.com",
            "taboola.com", "outbrain.com",
            "googletagmanager.com", "moatads.com",
            "facebook.com/tr", "google-analytics.com"
        ];

        const isAd = adDomains.some(domain => url.includes(domain));
        if (isAd) {
            console.log("🛑 Domain blocked:", url);
            return false;
        }

        // Allow only trusted domains
        if (!url.startsWith("https://www.moviehive.pro") &&
            !url.startsWith("https://ww5.123moviesfree.net")) {
            console.log("❌ External site blocked:", url);
            return false;
        }

        console.log("✅ Allowed:", url);
        return true;
    };

    // Simplified JavaScript injection (since AdGuard handles network-level blocking)
    const adBlockScript = `
    (function() {
      // Forward WebView console logs to React Native
      const originalLog = console.log;
      console.log = function(...args) {
        window.ReactNativeWebView.postMessage('[WebView LOG] ' + JSON.stringify(args));
        originalLog.apply(console, args);
      };

      console.log("🚀 WebView AdBlock script loaded (AdGuard handles network filtering)");

      // 🚫 Block window.open popups
      window.open = function() {
        console.log("🛑 Blocked window.open attempt!");
        return null;
      };

      // 🚫 Block location redirects
      Object.defineProperty(window.location, 'href', {
        set: function(url) {
          console.log("🛑 Blocked location.href change to:", url);
        }
      });
      window.location.assign = function(url) {
        console.log("🛑 Blocked location.assign to:", url);
      };
      window.location.replace = function(url) {
        console.log("🛑 Blocked location.replace to:", url);
      };

      // 🧹 Remove meta refresh redirects
      document.querySelectorAll('meta[http-equiv="refresh"]').forEach(el => {
        console.log("🛑 Removed meta refresh redirect");
        el.remove();
      });

      // 🧹 Clean visible ad elements
      function cleanAds() {
        const adSelectors = [
          "iframe[src*='ads']", "iframe[id*='google_ads']",
          "div[class*='ad']", "div[id*='ad']",
          "ins.adsbygoogle", "div[class*='sponsor']", 
          "div[class*='popup']"
        ];
        adSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            console.log("🧹 Removed ad element:", selector);
            el.remove();
          });
        });
      }

      // Initial cleanup
      cleanAds();

      // Watch for dynamically loaded ads
      const observer = new MutationObserver(() => {
        cleanAds();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      console.log("✅ WebView protection active!");
    })();

    true; // Required for Android
  `;

    const handleMessage = (event) => {
        console.log(event.nativeEvent.data);
    };

    return (
        <WebView
            source={{ uri: `https://www.moviehive.pro/embed?ep=${Id}` }}
            originWhitelist={["*"]}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            style={styles.container}
            onShouldStartLoadWithRequest={handleNavigation} // Enhanced with AdGuard
            injectedJavaScriptBeforeContentLoaded={adBlockScript}
            onMessage={handleMessage}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        backgroundColor: "black",
    },
});