import type { Socket } from "socket.io-client";
import type { Conversation, Message, Notification } from "./chat";
import type { Friend, FriendRequest, User } from "./user"; 

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean | null;         // Trạng thái hiển thị đang tải (loading) khi gọi API (ví dụ khi đang gửi yêu cầu SignUp hoặc SIgnIn) //

    setAccessToken: (accessToken: string) => void;   // Hàm actions lấy accessToken // 

    clearState: () => void;     // Hàm xoá trạng thái hiện tại //

    signUp: (                   // Hàm actions chứa logic gọi API đăng ký //
        username: string,
        password: string,
        email: string,
        firstname: string, 
        lastname: string
    ) => Promise<void>;

    signIn: (                   // Hàm actions chứa logic gọi API đăng nhập //
        username: String,
        password: String
    ) => Promise<void>;


    signOut: () => Promise<void>;

    fetchMe: () => Promise<void>;

    refresh: () => Promise<void>;

}

export interface ThemeState {
    isDark: boolean;

    toggleTheme: () => void;

    setTheme: (dark: boolean) => void;

}

export interface ChatState {
    conversations: Conversation[];
    messages: Record<string, {
        items: Message[],
        hasMore: boolean,
        nextCursor?: string | null
    }>
    activeConversationId: string | null,
    converLoading: boolean,
    messageLoading: boolean,
    loading: boolean,
    reset: () => void 

    setActiveConversation: (id: string | null) => void;

    fetchConversations: () => Promise<void>;

    fetchMessages: (conversationId?: string) => Promise<void>

    sendDirectMessages: (recipientId: string, content: string, image?: string | File, conversationId?: string) => Promise<void>

    sendGroupMessages: (conversationId: string, content: string, image?: string | File) => Promise<void>

    // Add message //

    addMessage: (message: Message) => Promise<void>

    // update conversation // 

    UpdateConversation: (conversation: unknown)=> void;

    markAsSeen: () => Promise<void>;

    addConversation: (conver: Conversation) => Promise<void>;

    createConversation: (type: "direct" | "group", name: string, memberIds: string[]) => Promise<void>;

}

export interface SocketState {
    socket: Socket | null
    OnlineUsers: string[]
    connectSocket: () => void
    disconnectSocket: () => void

}

export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedRequestList: FriendRequest[];
  sentRequestList: FriendRequest[];
  searchByUsername: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?: string) => Promise<string>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  getAllRequests: () => Promise<void>;
  getAllFriends: () => Promise<void>;

}

export interface NotificationSate {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    fetchNotifications: () => Promise<void>;
    markAllAsRead: () => Promise<void>;
    
    // Logic xử lý lời mời
    acceptFriendRequest: (notificationId: string, requestId: string) => Promise<void>;
    declineFriendRequest: (notificationId: string, requestId: string) => Promise<void>;

    // Hàm thêm 1 notifications (thông báo) mới //
    addOneNotification: (notification: Notification) => void;
}
