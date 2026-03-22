import { create } from "zustand";
import { notificationAPI } from "../services/api";
import { io } from "socket.io-client";

let socket = null;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const res = await notificationAPI.getNotifications();
      set({ notifications: res.data.notifications, unreadCount: res.data.unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAllRead: async () => {
    try {
      await notificationAPI.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch { /* ignore */ }
  },

  markOneRead: async (id) => {
    try {
      await notificationAPI.markOneRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch { /* ignore */ }
  },

  // Connect socket for real-time notifications
  connectSocket: (userId) => {
    if (socket) return; // already connected
    socket = io(window.location.origin, { query: { userId }, withCredentials: true });
    socket.on("notification", (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
}));

export default useNotificationStore;
