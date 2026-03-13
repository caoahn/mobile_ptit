import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useEffect } from "react";

import { useAuthStore } from "@/src/features/auth/store/authStore";
import { View, ActivityIndicator } from "react-native";
import { authEvents, AUTH_EVENTS } from "@/src/shared/services/api/authEvents";
import { socketClient } from "@/src/shared/services/socket";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import { GlobalDialog } from "@/src/components/common/GlobalDialog";
import { toastConfig } from "@/src/components/common/toastConfig";

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth, logout, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    authEvents.on(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);

    return () => {
      authEvents.off(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    };
  }, [logout]);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketClient.connect(user.id);
    } else {
      socketClient.disconnect();
    }

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if already authenticated
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#29a38f" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create"
          options={{ presentation: "fullScreenModal" }}
        />
        <Stack.Screen name="recipe/[id]" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
      <GlobalDialog />
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}
