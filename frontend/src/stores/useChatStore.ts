import { chatService } from '@/services/chatService';
import type { ChatState } from '@/types/store';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';
import type { Conversation } from '@/types/chat';
import { useSocketStore } from './useSocketStores';

export const useChatStore = create<ChatState>() (

    persist (
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            // Tách phần loading của conversation và message ra để nếu mà lấy API ở phần message
            // Thì phần conversations sẽ không bị tải lại gây mất mỹ quan và ngược lại //

            converLoading: false,
            messageLoading: false,
            loading: false,

            setActiveConversation: (id) => set({activeConversationId: id}),

            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    converLoading: false
                })
            },

            fetchConversations: async () => {
                try {
                    set({converLoading: true});
                    const {conversations} = await chatService.fetchConversations();
                    set({conversations, converLoading: false});
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchConversation", error);
                    set({converLoading: false});
                }
            },

            fetchMessages: async (conversationId) => {
                const { activeConversationId, messages } = get();
                const { user } = useAuthStore.getState();

                const converId = conversationId ?? activeConversationId;
                if (!converId) return;

                const current = messages?.[converId];
                // Nếu chưa có nextCursor thì mặc định là "", nếu là null thì dừng
                const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;
                
                if (nextCursor === null) return;

                set({ messageLoading: true });

                try {
                    const response = await chatService.fetchMessages(converId, nextCursor);

                    // console.log("Data từ service:", response.messages);

                    if (!response.messages) {
                        console.error("Lỗi: Service không trả về mảng messages");
                        return;
                    }

                    const fetched = response.messages;

                    // 1. Xử lý isOwn cho dữ liệu mới lấy về
                    const processed = fetched.map((m) => ({
                        ...m,
                        isOwn: m.senderId === user?._id
                    }));

                    set((state) => {
                        const prev = state.messages[converId]?.items ?? [];

                        // 2. Fix lỗi nhân đôi tin nhắn bằng Map
                        const msgMap = new Map();

                        // Đưa tin nhắn CŨ vào Map
                        prev.forEach(m => msgMap.set(m._id, m));

                        // Đưa tin nhắn MỚI (đã processed) vào Map
                        // LƯU Ý: Phải dùng 'processed' ở đây, không dùng 'fetched'
                        processed.forEach(m => msgMap.set(m._id, m));

                        // 3. Chuyển lại thành mảng và sắp xếp (Cũ nhất -> Mới nhất)
                        const merged = Array.from(msgMap.values()).sort((a, b) => 
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        );

                        return {
                            messages: {
                                ...state.messages,
                                [converId]: {
                                    items: merged,
                                    hasMore: !!response.cursor,
                                    nextCursor: response.cursor ?? null
                                }
                            }
                        };
                    });

                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchMessages", error);
                } finally {
                    set({ messageLoading: false });
                }
            },

            sendDirectMessages: async(recipientId, content, imgUrl) => {
                try {
                    const {activeConversationId} = get();
                    await chatService.sendDirectMessages(recipientId, content, imgUrl, activeConversationId || undefined);

                    set((state) => ({
                        conversations: state.conversations.map((c) => c._id === activeConversationId ? {...c, seenBy: []} : c)

                    }))
                    
                } catch (error) {
                    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);

                }
            },

            sendGroupMessages: async(conversationId, content, imgUrl) => {
                try {
                    const {activeConversationId}= get();
                    await chatService.sendGroupMessages(conversationId, content, imgUrl);
                    set((state) => ({
                        conversations: state.conversations.map((c) => c._id === activeConversationId ? {...c, seenBy: []} : c)
                    }))
                    
                } catch (error) {
                    console.error("Lỗi khi gửi tin nhắn nhóm", error);

                }
            },

            addMessage: async (message) => {
                try {
                    const {user} = useAuthStore.getState();
                    const {fetchMessages} = get();

                    message.isOwn = message.senderId == user?._id;

                    const conver = message.conversationId;

                    // PrevItems chứa các tin nhắn cũ //
                    let prevItems = get().messages[conver]?.items ?? [];

                    // Cập nhật state (trạng thái) của messages //

                    set((state) => {
                        if(prevItems.some((m) => m._id == message._id))
                        {
                            return state;
                        }

                        return {
                            messages: {
                                ...state.messages,   // Giữ nguyên các state của các tin nhắn trong các conversations khác //
                                [conver]: {          // Thêm message mới nhập vào mảng tin nhắn của conversation = conver //
                                    items: [...prevItems, message],
                                    hasMore: state.messages[conver].hasMore,
                                    nextCursor: state.messages[conver].nextCursor
                                }
                            }
                        }
                    })
                    
                } catch (error) {
                    console.error("Lỗi xảy ra khi add Message", error);                    
                }
            },

            UpdateConversation: (conversation) => {
                const newCon = conversation as Conversation;
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c._id == newCon._id ? {...c, ...newCon} : c       
                    )
                }))
            },

            markAsSeen: async () => {
                try {
                    const {user} = useAuthStore.getState();

                    const {activeConversationId, conversations} = get();

                    if(!activeConversationId || !user)
                    {
                        return;
                    }

                    const conver = conversations.find((c) => c._id === activeConversationId);
                    if(!conver)
                    {
                        return;
                    }
                    if((conver.unreadCounts?.[user._id] ?? 0) === 0)
                    {
                        return;
                    }

                    await chatService.markAsSeen(activeConversationId);
                    set((state) => ({
                        conversations: state.conversations.map((c) => (
                            c._id === activeConversationId && c.lastMessage ? {
                                ...c,
                                unreadCounts: {
                                    ...c.unreadCounts,
                                    [user._id]: 0
                                }
                            }
                            : c
                        ))

                    }))
                    
                } catch (error) {
                    console.error("Lỗi khi gọi markAsSeen trong store", error);
                    
                }
            },

            addConversation: async (conver)  => {
                set((state) => {
                    const exists = state.conversations.some((c) => c._id.toString() === conver._id.toString());

                    return {
                        conversations: exists ? state.conversations : [...state.conversations, conver],
                        activeConversationId: conver._id
                    }

                })
            },

            createConversation: async (type, name, memberIds) => {
                try {
                    set({loading: true});
                    const conversation = await chatService.createConversation(type, name, memberIds);

                    get().addConversation(conversation);

                    useSocketStore.getState().socket?.emit("join-conversation", conversation._id);
                    
                } catch (error) {
                    console.error("Lỗi xảy ra khi gọi createConversation", error);
                    
                } finally {
                    set({loading: false});
                }    
            },
        }),

        {
            name: "Chat-Storage",
            partialize: (state) => ({conversations: state.conversations})
        }
    )
)