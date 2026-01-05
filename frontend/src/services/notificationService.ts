import api from "@/lib/axios"; 

export const notificationService = {
    // 1. Lấy danh sách thông báo
    getAllNotifications: async () => {
        // Gọi GET /api/notifications
        const response = await api.get("/notifications");
        return response.data;
    },

    // 2. Đánh dấu tất cả là đã đọc
    markAllAsRead: async () => {
        // Gọi PUT /api/notifications/read
        const response = await api.put("/notifications/read");
        return response.data;
    },

    acceptFriendRequest: async (requestId: string) => {
        try {
            const response = await api.post(`/friends/requests/${requestId}/accept`);
            return response.data;    
        } catch (error) {
            console.error("Lỗi xảy ra khi đồng ý kết bạn", error);
            
        }
    },

    declineFriendRequest: async (requestId: string) => {
        try {
            const response = await api.post(`/friends/requests/${requestId}/decline`);
            return response.data;   
        } catch (error) {
            console.error("Lỗi xảy ra khi từ chối kết bạn", error);
            
        }
    }
};