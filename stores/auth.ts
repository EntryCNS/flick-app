import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthTokens, User } from "@/types/auth";
import { api } from "@/lib/axios";

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

  setTokens: async ({ accessToken, refreshToken }) => {
    await SecureStore.setItemAsync("access_token", accessToken);
    await SecureStore.setItemAsync("refresh_token", refreshToken);
    set({ isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  fetchUserProfile: async () => {
    try {
      const { data } = await api.get<User>("/users/me");
      set({ user: data });
    } catch (error) {
      console.error("Failed to fetch user profile");
    }
  },

  logout: async () => {
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
    console.error("Failed to load tokens");
  }

  return false;
};
