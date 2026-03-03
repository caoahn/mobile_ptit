import apiClient from "@/src/shared/services/api/client";
import { NotificationListResponse } from "../types/notification.types";

/**
 * Lấy danh sách thông báo
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
): Promise<NotificationListResponse> => {
  const response = await apiClient.get<{ data: NotificationListResponse }>(
    `/notifications?page=${page}&limit=${limit}`,
  );
  return response.data.data;
};

/**
 * Đếm số thông báo chưa đọc
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<{ data: { count: number } }>(
    "/notifications/unread-count",
  );
  return response.data.data.count;
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.put(`/notifications/${notificationId}/read`);
};

/**
 * Đánh dấu tất cả đã đọc
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.put("/notifications/read-all");
};

/**
 * Xóa thông báo
 */
export const deleteNotification = async (
  notificationId: number,
): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
};
