import React from "react";
import { Stack } from "expo-router";
import { COLORS } from "@/constants/colors";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="qr-scanner" options={{ presentation: "modal" }} />
        <Stack.Screen name="payment" options={{ presentation: "modal" }} />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="booths/[boothId]" />
        <Stack.Screen name="notices/[noticeId]" />
        <Stack.Screen name="transactions/[transactionId]" />
      </Stack>
    </View>
  );
}
