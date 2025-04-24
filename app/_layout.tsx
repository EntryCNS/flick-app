import ThemeProvider from "@/components/ThemeProvider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PretendardThin: require("../assets/fonts/Pretendard-Thin.otf"),
    PretendardExtraLight: require("../assets/fonts/Pretendard-ExtraLight.otf"),
    PretendardLight: require("../assets/fonts/Pretendard-Light.otf"),
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    PretendardMedium: require("../assets/fonts/Pretendard-Medium.otf"),
    PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.otf"),
    PretendardBold: require("../assets/fonts/Pretendard-Bold.otf"),
    PretendardExtraBold: require("../assets/fonts/Pretendard-ExtraBold.otf"),
    PretendardBlack: require("../assets/fonts/Pretendard-Black.otf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="qr-scanner" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
