import React, { useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";
import { Feather } from "@expo/vector-icons";

const APP_URL =
  process.env.EXPO_PUBLIC_APP_URL ??
  `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}app/`;

export default function AppScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [canGoBack])
  );

  function handleNavChange(nav: WebViewNavigation) {
    setCanGoBack(nav.canGoBack);
  }

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Feather name="wifi-off" size={48} color="#8898aa" />
        <Text style={styles.errorTitle}>אין חיבור לאינטרנט</Text>
        <Text style={styles.errorSub}>בדוק את החיבור שלך ונסה שוב</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setError(false);
            setLoading(true);
            webViewRef.current?.reload();
          }}
        >
          <Text style={styles.retryText}>נסה שוב</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        onHttpError={() => setError(true)}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        startInLoadingState={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        mixedContentMode="compatibility"
        userAgent="BizzSenderApp/1.0 (Android)"
      />
      {loading && (
        <View style={[styles.loadingOverlay, { paddingTop: insets.top }]}>
          <View style={styles.loadingInner}>
            <View style={styles.logoBox}>
              <Feather name="message-circle" size={40} color="#fff" />
            </View>
            <Text style={styles.loadingTitle}>Bizz Sender</Text>
            <ActivityIndicator
              size="large"
              color="#1171ef"
              style={{ marginTop: 24 }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1171ef",
  },
  webview: {
    flex: 1,
    backgroundColor: "#f8f9fe",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8f9fe",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingInner: {
    alignItems: "center",
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: "#1171ef",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1171ef",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1f36",
    fontFamily: "Inter_600SemiBold",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fe",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#32325d",
    marginTop: 16,
    fontFamily: "Inter_600SemiBold",
  },
  errorSub: {
    fontSize: 14,
    color: "#8898aa",
    marginTop: 8,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: "#1171ef",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
