import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

export default function AuthLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    async function initialize() {
      try {
        await checkAuth();
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    initialize();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.white,
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={COLORS.primary500} />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.white },
        }}
      />
    </>
  );
}
