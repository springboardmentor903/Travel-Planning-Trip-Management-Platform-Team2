import apiClient from "./apiClient";
import { NotificationResponse } from "./types";

export async function getMyNotifications(): Promise<NotificationResponse[]> {
    const res = await apiClient.get<NotificationResponse[]>("/api/notifications");
    return res.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
    const res = await apiClient.get<{ unreadCount: number }>("/api/notifications/unread-count");
    return res.data.unreadCount;
}

export async function markNotificationAsRead(id: number): Promise<NotificationResponse> {
    const res = await apiClient.put<NotificationResponse>(`/api/notifications/${id}/read`);
    return res.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await apiClient.put("/api/notifications/read-all");
}
