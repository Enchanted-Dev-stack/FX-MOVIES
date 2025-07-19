import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import Orientation from 'react-native-orientation-locker';

export default function EmbeddedPlayer({ route }) {
  const { Id } = route.params;

  useEffect(() => {
    // 🔒 Lock orientation to landscape
    Orientation.lockToLandscape();

    // 🚫 Hide status bar completely
    StatusBar.setHidden(true, 'fade');

    return () => {
      // 🔓 Unlock orientation when leaving
      // Orientation.unlockAllOrientations();
      Orientation.lockToPortrait();
      
      // ✅ Show status bar again when leaving
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  // 🚫 Block ad/tracker domains
  const adBlockDomains = [
    "doubleclick.net",
    "googlesyndication.com",
    "adservice.google.com",
    "ads.yahoo.com",
    "analytics.twitter.com",
    "facebook.net",
    "adnxs.com",
    "taboola.com",
    "outbrain.com",
    "scorecardresearch.com",
  ];

  const handleNavigation = (request) => {
    const url = request.url;

    // 🛑 Block requests to ad/tracker domains
    const shouldBlock = adBlockDomains.some(domain => url.includes(domain));
    if (shouldBlock) {
      console.log("🛑 Blocked ad/tracker request:", url);
      return false;
    }

    // ✅ Allow only your domain to load
    if (url.startsWith("https://www.moviehive.pro")) {
      console.log("✅ Allowed:", url);
      return true;
    }

    // 🚫 Block external navigation
    console.log("❌ Blocked external navigation to:", url);
    return false;
  };

  // 🧹 Injected JS to clean up ad elements from the DOM
  const adBlockScript = `
    const adSelectors = [
      "iframe[src*='ads']",
      "div[id*='ad']",
      "div[class*='ad']",
      "aside",
      "footer > .sponsored",
      "div[class*='sponsor']",
      "div[class*='popup']"
    ];

    function removeAds() {
      adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    }

    // 🧹 Initial cleanup
    removeAds();

    // 🔁 Keep cleaning dynamically loaded ads every 2 seconds
    setInterval(removeAds, 2000);

    true; // Required for Android
  `;

  return (
    <WebView
      source={{ uri: `https://www.moviehive.pro/embed?ep=${Id}` }}
      originWhitelist={["*"]}
      allowsFullscreenVideo
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
      }}
      onShouldStartLoadWithRequest={handleNavigation} // 👈 Intercept navigation
      injectedJavaScript={adBlockScript} // 🧹 Clean up ads in the DOM
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
