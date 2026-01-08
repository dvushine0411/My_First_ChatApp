import {create} from 'zustand';
import {io, Socket} from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import type { SocketState } from '@/types/store';
import { useChatStore } from './useChatStore';
import { useNotificationStore } from './useNotificationStore';

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    OnlineUsers: [],
    connectSocket: () => {
        const {accessToken, user} = useAuthStore.getState();
        const exsitingSocket = get().socket;

        if(exsitingSocket)     return;

        const socket: Socket = io(baseURL, {
            auth: {token: accessToken},
            query: {
                userId: user?._id
            },

            transports: ["websocket"]
        });

        set({socket});
        socket.on("connect", () => {
            console.log("Đã kết nối với socket");
        })

        // Lắng nghe sự kiện onlineusers // 

        socket.on("online-users", (userIds) => {
            set({OnlineUsers: userIds});
        })

        // Lắng nghe sự kiện New Message //
        socket.on("new-message", ({message, conversation, unreadCounts}) => {
            useChatStore.getState().addMessage(message);

            const lastMessage = {
                _id: conversation.lastMessage._id,
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: {
                    _id: conversation.lastMessage.senderId,
                    displayName: "",
                    avatarUrl: null
                }
            };

            const updatedConversation = {
                ...conversation,
                lastMessage,
                unreadCounts,
            }

            if(useChatStore.getState().activeConversationId == message.conversationId)
            {
                // Phần này xử lý phần marAsSeen tức là hiển thị seen nếu người đó đang trong đoạn chat mà có tin nhắn đến // 
                useChatStore.getState().markAsSeen();
            }

            useChatStore.getState().UpdateConversation(updatedConversation);
            
        }),

        // Lắng nghe sự kiện read-message để hiển thị seen real time //
        socket.on("read-message", ({conversation, lastMessage}) => {
            const updated = {
                _id: conversation._id,
                lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                unreadCounts: conversation.unreadCounts,
                seenBy: conversation.seenBy
            };

            useChatStore.getState().UpdateConversation(updated);
        })

        // Lắng nghe sự kiện new-notification để hiển thị thông báo realtime //
        socket.on("new-notification", (newNotif) => {
            console.log("Socket nhận new notification: ", newNotif);
            useNotificationStore.getState().addOneNotification(newNotif);
        })

        // Lắng nghe sự kiện new-group-chat //
        socket.on('new-group', (conversation) => {
            useChatStore.getState().addConversation(conversation);
            socket.emit('join-conversation', conversation._id);
        })
        
        // Lắng nghe sự kiện new-direct-chat //
        socket.on("new-conversation", (conversation) => {
            useChatStore.getState().addConversation(conversation);
            socket.emit("join-conversation", conversation._id);

        })

        // Lắng nghe sự kiện isTyping //
        socket.on("typing", (roomId) => {
            console.log("CLIENT NHẬN: Server báo có người gõ ở phòng:", roomId); // Log 3
            console.log("Phòng đang mở hiện tại là:", useChatStore.getState().activeConversationId);
            if(roomId == useChatStore.getState().activeConversationId)
            {
                useChatStore.getState().setTyping(true);
            }
        })

        // Lắng nghe sự kiện stopTyping //
        socket.on("Stop-typing", (roomId) => {
            if(roomId == useChatStore.getState().activeConversationId)
            {
                useChatStore.getState().setTyping(false);
            }
        })

        socket.on("connect_error", (err) => {
            console.error("Lỗi kết nối Socket:", err.message); 
            // Nếu nó in ra "jwt expired" hoặc "Authentication error" thì là do token
        });

    },

    

    disconnectSocket: () => {
    const socket = get().socket;
    
    if (socket) {
        // Chỉ ngắt nếu socket đang thực sự kết nối
        if (socket.connected) {
            socket.disconnect();
        } 
        // Nếu nó đang 'connecting' dở dang thì kệ nó, 
        // gán null để lần sau nó tự tạo cái mới
        set({ socket: null });
    }
}

    

}));
