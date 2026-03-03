import { create } from "zustand";
import { Notification } from "../types/notification.types";
import * as notificationService from "../services/notificationService";
import { socketClient } from "@/src/shared/services/socket";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  page: number;
  hasMore: boolean;

  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  addNotification: (notification: Notification) => void;
  initSocketListener: () => void;
  cleanupSocketListener: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  page: 1,
  hasMore: true,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const response = await notificationService.getNotifications(page, 20);

      set({
        notifications:
          page === 1
            ? response.notifications
            : [...get().notifications, ...response.notifications],
        unreadCount: response.unread_count,
        page,
        hasMore: response.hasMore,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);

      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId,
        );
        const wasUnread = notification && !notification.is_read;

        return {
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId,
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  initSocketListener: () => {
    // Lắng nghe event thông báo mới từ server
    socketClient.on("new_notification", (notification: Notification) => {
      console.log("📩 New notification received:", notification);
      get().addNotification(notification);

      // TODO: Có thể show local notification ở đây
      // showLocalNotification(notification);
    });
  },

  cleanupSocketListener: () => {
    socketClient.off("new_notification");
  },
}));
