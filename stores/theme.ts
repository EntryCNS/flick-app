import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "../constants/theme";
import type { Theme } from "@emotion/react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode, systemIsDark?: boolean) => void;
  toggleTheme: (systemIsDark?: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      return {
        theme: lightTheme, // Default initial theme
        mode: "system" as ThemeMode,
        isDark: false, // Default to light

        setMode: (mode, systemIsDark = false) => {
          switch (mode) {
            case "light":
              set({
                mode: "light",
                theme: lightTheme,
                isDark: false,
              });
              break;
            case "dark":
              set({
                mode: "dark",
                theme: darkTheme,
                isDark: true,
              });
              break;
            case "system":
              set({
                mode: "system",
                theme: systemIsDark ? darkTheme : lightTheme,
                isDark: systemIsDark,
              });
              break;
          }
        },

        toggleTheme: (systemIsDark = false) => {
          const currentMode = get().mode;

          if (currentMode === "system") {
            set({
              mode: systemIsDark ? "light" : "dark",
              theme: systemIsDark ? lightTheme : darkTheme,
              isDark: !systemIsDark,
            });
          } else {
            const newMode = currentMode === "light" ? "dark" : "light";
            set({
              mode: newMode,
              theme: newMode === "dark" ? darkTheme : lightTheme,
              isDark: newMode === "dark",
            });
          }
        },
      };
    },
    {
      name: "flick-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
