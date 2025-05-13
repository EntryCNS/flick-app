import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthTokens, User } from "@/types/auth";
import api from "@/libs/api";

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
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
    (set, get) => {
      return {
        isLoggedIn: false,
        user: null,
        isInitialized: false,
        isLoading: false,

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
            set({ isLoading: true });
            const { data } = await api.get<User>("/users/me");
            set({ user: data, isLoading: false });
          } catch (error) {
            console.error("프로필 정보 가져오기 실패:", error);
            const authStore = get();
            await authStore.signOut();
            set({ isLoading: false });
          }
        },

        signOut: async () => {
          try {
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
          } catch (error) {
            console.error("토큰 삭제 실패:", error);
          }
          set({ isLoggedIn: false, user: null });
        },

        checkAuth: async (): Promise<boolean> => {
          if (get().isInitialized) {
            return get().isLoggedIn && !!get().user;
          }

          try {
            set({ isLoading: true });
            const accessToken = await SecureStore.getItemAsync("access_token");
            const refreshToken = await SecureStore.getItemAsync(
              "refresh_token"
            );
            let isAuthenticated = !!(accessToken && refreshToken);

            if (isAuthenticated) {
              set({ isLoggedIn: true });
              if (!get().user) {
                try {
                  const { data } = await api.get<User>("/users/me");
                  set({ user: data });
                } catch (error) {
                  console.error("프로필 정보 가져오기 실패:", error);
                  await get().signOut();
                  set({ isLoggedIn: false });
                  isAuthenticated = false;
                }
              }
            }

            set({ isInitialized: true, isLoading: false });
            return isAuthenticated;
          } catch (error) {
            console.error("토큰 확인 실패:", error);
            set({ isInitialized: true, isLoading: false });
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
