import React, { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const navigateToQRScanner = useCallback(() => {
    router.push("/qr-scanner");
  }, [router]);

  const bottomInset = Platform.OS === "ios" ? insets.bottom : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          backgroundColor: COLORS.white,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.gray200,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        },
        tabBarActiveTintColor: COLORS.primary600,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "홈",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="booths"
        options={{
          tabBarLabel: "부스",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="qr-tab"
        options={{
          tabBarLabel: "",
          tabBarIcon: () => null,
          tabBarButton: () => (
            <View style={styles.qrContainer}>
              <TouchableOpacity
                style={styles.qrButton}
                activeOpacity={0.85}
                onPress={navigateToQRScanner}
                accessible={true}
                accessibilityLabel="QR 코드 스캔 결제"
                accessibilityRole="button"
              >
                <Ionicons name="qr-code" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.qrText}>결제</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          tabBarLabel: "공지",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "프로필",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: "center",
    top: -15,
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.primary600,
    marginTop: 2,
  },
});
