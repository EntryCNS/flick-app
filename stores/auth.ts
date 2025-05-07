import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthTokens, User } from "@/types/auth";
import api from "@/libs/api";
import { useNotificationStore } from "./notification";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthActions {
  setTokens: (tokens: AuthTokens) => Promise<void>;
  setUser: (user: User) => void;
  fetchUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: false,
  user: null,

  setTokens: async ({
    accessToken,
    refreshToken,
  }: AuthTokens): Promise<void> => {
    await SecureStore.setItemAsync("access_token", accessToken);
    await SecureStore.setItemAsync("refresh_token", refreshToken);
    set({ isAuthenticated: true });

    const { registerToken } = useNotificationStore.getState();
    await registerToken();
  },

  setUser: (user: User): void => set({ user }),

  fetchUserProfile: async (): Promise<void> => {
    try {
      const { data } = await api.get<User>("/users/me");
      set({ user: data });
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  },

  logout: async (): Promise<void> => {
    const { unregisterToken } = useNotificationStore.getState();
    await unregisterToken();

    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ isAuthenticated: false, user: null });
  },
}));

export const loadTokens = async (): Promise<boolean> => {
  try {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    if (accessToken && refreshToken) {
      useAuthStore.setState({ isAuthenticated: true });
      return true;
    }
  } catch (error) {
    console.error("Failed to load tokens", error);
  }
  return false;
};
