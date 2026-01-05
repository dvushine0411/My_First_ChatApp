import api from '@/lib/axios';

export const friendService = {
    async searchByUsername(username: string) {
        const res = await api.get(`/users/search?q=${username}`);

        const userList = res.data.users;

        if(userList && userList.length > 0)
        {
            return userList[0];
        }
        return null;
    },

    async sendFriendRequest(To_User: string, message?: string) {
        const res = await api.post("/friends/requests", {To_User, message});
        return res.data.message;
    },

    async acceptFriendRequest(requestId: string) {
        try {
            const res = await api.post(`/friends/requests/${requestId}/accept`);
            return res.data.requestAcceptedBy; 
        } catch (error) {
            console.error("Lỗi khi gửi accept request", error);
        }
    },

    async declineFriendRequest(requestId: string) {
        try {
            await api.post(`/friends/requests/${requestId}/decline`);
        } catch (error) {
            console.error("Lỗi khi decline request", error);
        }
        
    },

    async getAllRequests() {
        try {
            const res = await api.get("/friends/requests");
            const {sent, received} = res.data;
            return {sent, received};
        } catch (error) {
            console.log("Lỗi khi lấy danh requests", error);
        }
    },

    async getAllFriends() {
        try {
            const res = await api.get("/friends");
            return res.data.friends;
            
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bạn bè", error);
        }

    }
}