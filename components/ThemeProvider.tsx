import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { useThemeStore } from "@/stores/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const { theme, mode, setMode } = useThemeStore();

  useEffect(() => {
    if (mode === "system") {
      const systemIsDark = systemColorScheme === "dark";
      setMode("system", systemIsDark);
    }
  }, [systemColorScheme, mode, setMode]);

  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
}
