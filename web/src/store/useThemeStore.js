import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set) => ({
      theme: "corporate",
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "corporate" ? "business" : "corporate" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "galink-theme" }
  )
);

export default useThemeStore;
