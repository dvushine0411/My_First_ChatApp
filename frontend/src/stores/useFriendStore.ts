import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";



export const useFriendStore = create<FriendState>((set, get) => ({
    friends: [],
    loading: false,
    receivedRequestList: [],
    sentRequestList: [],

    searchByUsername: async (username) => {
        try {
            const user = await friendService.searchByUsername(username);

            return user;
            
        } catch (error) {
            console.error("Lỗi xảy ra khi tìm user ", error);
            return null;
        } finally {
            set({loading: false});
        }
    },


    addFriend: async (to, message) => {
        try {
            set({loading: true});
            const resultMessage = await friendService.sendFriendRequest(to, message);

            return resultMessage;
        } catch (error) {
            console.error("Lỗi khi gửi lời mời kết bạn", error);
            return "Lỗi xảy ra khi gửi lời mời kết bạn. Hãy thử lại!"
        } finally {
            set({loading: false});
        }
    },

    acceptFriendRequest: async (requestId) => {
        try {
            set({loading: true});
            await friendService.acceptFriendRequest(requestId);

            set((state) => ({
                receivedRequestList: state.receivedRequestList.filter((r) => r.id != requestId)
            }))
            
        } catch (error) {
            console.error("Lỗi khi đồng ý lời mời kết bạn", error);

        } finally {
            set({loading: false});
        }

    },

    declineFriendRequest: async (requestId) => {
        try {
            set({loading: true});
            await friendService.declineFriendRequest(requestId);

            set((state) => ({

                receivedRequestList: state.receivedRequestList.filter((r) => r.id != requestId)
            }));
            
        } catch (error) {
            console.error("Lỗi khi từ chối lời mời kết bạn", error);
            
        } finally {
            set({loading: false});
        }
    },

    getAllFriends: async () => {
        try {
            set({loading: true});
            const friends = await friendService.getAllFriends();
            set({friends: friends})
            
        } catch (error) {
            console.error("Lỗi khi lấy ra danh sách bạn bè", error);
            set({friends: []});

        } finally {
            set({loading: false});
        }
    },

    getAllRequests: async () => {
        try {
            set({loading: true});
            const result = await friendService.getAllRequests();

            if(!result)    return;
            const {received, sent} = result;

            set({receivedRequestList: received, sentRequestList: sent});
            
        } catch (error) {
            console.error("Lỗi khi lấy ra danh sách requests", error);
            set({receivedRequestList: [], sentRequestList: []});
            
        } finally {
            set({loading: false});

        }

    },

}));


