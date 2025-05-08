import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthTokens, User } from "@/types/auth";
import api from "@/libs/api";
import { useNotificationStore } from "./notification";

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

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isLoggedIn: false,
  user: null,

  saveTokens: async ({
    accessToken,
    refreshToken,
  }: AuthTokens): Promise<void> => {
    await SecureStore.setItemAsync("access_token", accessToken);
    await SecureStore.setItemAsync("refresh_token", refreshToken);
    set({ isLoggedIn: true });
    const { registerToken } = useNotificationStore.getState();
    await registerToken();
  },

  updateUser: (user: User): void => set({ user }),

  getProfile: async (): Promise<void> => {
    try {
      const { data } = await api.get<User>("/users/me");
      set({ user: data });
    } catch (error) {
      console.error("프로필 정보 가져오기 실패", error);
    }
  },

  signOut: async (): Promise<void> => {
    const { unregisterToken } = useNotificationStore.getState();
    await unregisterToken();
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ isLoggedIn: false, user: null });
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const refreshToken = await SecureStore.getItemAsync("refresh_token");

      if (accessToken && refreshToken) {
        set({ isLoggedIn: true });
        return true;
      }
    } catch (error) {
      console.error("토큰 확인 실패", error);
    }
    return false;
  },
}));
