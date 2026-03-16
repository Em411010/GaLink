import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login(data);
          set({ user: res.data, isLoading: false });
          return res.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          set({ user: res.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        try { await authAPI.logout(); } catch {}
        set({ user: null });
      },
      setUser: (user) => set({ user }),
      updateUser: (user) => set({ user }),
      fetchMe: async () => {
        try {
          const res = await authAPI.getMe();
          set({ user: res.data });
        } catch {
          set({ user: null });
        }
      },
    }),
    { name: "galink-auth", partialize: (state) => ({ user: state.user }) }
  )
);
export default useAuthStore;
