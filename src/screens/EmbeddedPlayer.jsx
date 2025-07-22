import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import Orientation from 'react-native-orientation-locker';

export default function EmbeddedPlayer({ route }) {
  const { Id } = route.params;

  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true, 'fade');
    console.log('📺 EmbeddedPlayer mounted');

    return () => {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  // 🧨 Inject Full Hybrid Adblocker
  const adBlockScript = `
    (function() {
      // Forward WebView console logs to React Native
      const originalLog = console.log;
      console.log = function(...args) {
        window.ReactNativeWebView.postMessage('[WebView LOG] ' + JSON.stringify(args));
        originalLog.apply(console, args);
      };

      console.log("🚀 Injecting Full Hybrid Adblocker...");

      // 🚫 Block window.open popups
      window.open = function() {
        console.log("🛑 Blocked window.open attempt!");
        return null;
      };

      // 🚫 Block window.location redirects
      const originalAssign = window.location.assign;
      const originalReplace = window.location.replace;
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

      // 🧹 Clean banner ads, iframes, and sponsored sections
      function cleanAds() {
        const adSelectors = [
          "iframe[src*='ads']", "iframe[id*='google_ads']",
          "div[class*='ad']", "div[id*='ad']",
          "ins.adsbygoogle", "aside", "footer .sponsored",
          "div[class*='sponsor']", "div[class*='popup']"
        ];
        adSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            console.log("🧹 Removed ad element:", selector);
            el.remove();
          });
        });
      }

      // 🧨 Remove malicious click event listeners
      function removeClickHijack() {
        console.log("🧨 Removing all click event listeners from document and body");

        // Replace body & html nodes to wipe all event listeners
        const docClone = document.documentElement.cloneNode(true);
        document.replaceChild(docClone, document.documentElement);
      }

      // 🕵️‍♂️ Simulate first click to burn "first click hijack"
      setTimeout(() => {
        try {
          document.body.click();
          console.log("🕵️‍♂️ Simulated first click to neutralize first-click popups");
        } catch (e) {
          console.log("⚠️ Failed to simulate first click", e);
        }
      }, 100);

      // Initial cleanup
      cleanAds();
      removeClickHijack();

      // Watch for dynamically loaded ads or re-attached listeners
      const observer = new MutationObserver(() => {
        cleanAds();
        removeClickHijack();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // 🚀 Load Cliqz Adblocker for network-level filtering
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@cliqz/adblocker-webextension/dist/adblocker.umd.min.js';
      script.onload = () => {
        console.log("🛡️ Cliqz Adblocker library loaded!");
        const { Adblocker } = window;
        const engine = Adblocker.fromPrebuiltAdsAndTracking();
        engine.enableBlockingInBrowserContext(window, {
          debug: true,
          onBlockedRequest: (url) => {
            console.log("🛑 Blocked network request:", url);
          }
        });
        console.log("✅ Cliqz Adblocker enabled!");
      };
      document.head.appendChild(script);
    })();

    true; // Required for Android
  `;

  // 🌐 Network-level domain blocker
  const adDomains = [
    "doubleclick.net", "googlesyndication.com",
    "adservice.google.com", "ads.yahoo.com",
    "taboola.com", "outbrain.com",
    "googletagmanager.com", "moatads.com"
  ];

  const handleNavigation = ({ url }) => {
    const isAd = adDomains.some(domain => url.includes(domain));
    if (isAd) {
      console.log("🛑 Blocked network request to:", url);
      return false; // Block ad/tracker domains
    }
    if (!url.startsWith("https://www.moviehive.pro") && !url.startsWith("https://ww5.123moviesfree.net")) {
      console.log("❌ Blocked external navigation to:", url);
      return false; // Block external sites
    }
    console.log("✅ Allowed:", url);
    return true;
  };

  const handleMessage = (event) => {
    console.log(event.nativeEvent.data); // Show WebView logs in React Native console
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
      onShouldStartLoadWithRequest={handleNavigation} // 👈 Network filter
      injectedJavaScriptBeforeContentLoaded={adBlockScript} // 👈 Inject Hybrid Shield
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
