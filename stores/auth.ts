import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthTokens, User } from "@/types/auth";
import api from "@/libs/api";

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

interface AuthActions {
  saveTokens: (tokens: AuthTokens) => Promise<void>;
  updateUser: (user: User) => void;
  getProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => {
      let initialized = false;
      return {
        isLoggedIn: false,
        user: null,
        saveTokens: async ({
          accessToken,
          refreshToken,
        }: AuthTokens): Promise<void> => {
          try {
            await SecureStore.setItemAsync("access_token", accessToken);
            await SecureStore.setItemAsync("refresh_token", refreshToken);
            set({ isLoggedIn: true });
          } catch (error) {
            console.error("토큰 저장 실패:", error);
          }
        },
        updateUser: (user: User): void => {
          set({ user });
        },
        getProfile: async (): Promise<void> => {
          try {
            const { data } = await api.get<User>("/users/me");
            set({ user: data });
          } catch (error) {
            console.error("프로필 정보 가져오기 실패:", error);
          }
        },
        signOut: async (): Promise<void> => {
          try {
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
          } catch (error) {
            console.error("토큰 삭제 실패:", error);
          }
          set({ isLoggedIn: false, user: null });
        },
        checkAuth: async (): Promise<boolean> => {
          if (initialized) return true;

          try {
            const accessToken = await SecureStore.getItemAsync("access_token");
            const refreshToken = await SecureStore.getItemAsync(
              "refresh_token"
            );
            const isAuthenticated = !!(accessToken && refreshToken);
            initialized = true;
            if (isAuthenticated) {
              set({ isLoggedIn: true });
            }
            return isAuthenticated;
          } catch (error) {
            console.error("토큰 확인 실패:", error);
            return false;
          }
        },
      };
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
    }
  )
);
