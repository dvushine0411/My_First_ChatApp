import { notificationService } from '@/services/notificationService';
import type { NotificationSate } from '@/types/store';
import {create} from 'zustand';


export const useNotificationStore = create<NotificationSate>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({isLoading: true});
        try {
            const notifs = await notificationService.getAllNotifications();
            const unread = notifs.filter((n: any) => !n.isRead).length;
            set({notifications: notifs, unreadCount: unread});
            
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thông báo", error);
        } finally {
            set({isLoading: false});
        }
    },

    addOneNotification: (newNotification) => {
        set((state) => ({
            notifications: [...state.notifications, newNotification],
            unreadCount: state.unreadCount + 1,
        }))
    },

    acceptFriendRequest: async (notificationId, requestId) => {
        try {
            await notificationService.acceptFriendRequest(requestId);
            set((state) => ({
                notifications: state.notifications.filter((n) => n._id != notificationId),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }))
            
        } catch (error) {
            console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
        }
    },

    declineFriendRequest: async (notificationId, requestId) => {
        try {
            await notificationService.declineFriendRequest(requestId);
            set((state) => ({
                notifications: state.notifications.filter((n) => n._id != notificationId),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }))
            
        } catch (error) {
            console.error("Lỗi khi từ chối lời mời kết bạn", error);
        }
    },

    markAllAsRead: async () => {
        const {unreadCount, notifications} = get();
        if(unreadCount == 0)    return;
        try {
            await notificationService.markAllAsRead();
            set({
                unreadCount: 0,
                notifications: notifications.map(n => ({...n, isRead: true}))
            })
            
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc thông báo", error);
            
        }

    }
    
}))