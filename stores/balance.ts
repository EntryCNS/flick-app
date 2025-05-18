import { create } from "zustand";
import api from "@/libs/api";

interface BalanceState {
  balance: number | null;
  isLoading: boolean;
  error: Error | null;
  fetchBalance: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  setBalance: (balance: number) => void;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balance: null,
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    const currentBalance = get().balance;

    if (get().isLoading) return;

    if (currentBalance !== null) return;

    set({ isLoading: true });

    try {
      const response = await api.get<number>("/users/me/balance");
      set({ balance: response.data, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error("Unknown error") });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshBalance: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get<number>("/users/me/balance");
      set({ balance: response.data, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error("Unknown error") });
    } finally {
      set({ isLoading: false });
    }
  },

  setBalance: (newBalance) => {
    set({ balance: newBalance });
  },
}));
