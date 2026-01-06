import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import UnreadCountBadge from "./unreadCountBadge";
import { useSocketStore } from "@/stores/useSocketStores";


const DirectMessageCard = ({conver}: { conver: Conversation }) => {
    const {user} = useAuthStore();
    const {activeConversationId, setActiveConversation, messages, fetchMessages} = useChatStore();
    const {OnlineUsers} = useSocketStore();

    if(!user) return null

    // Lọc ra những người mà user đang nói chuyện cùng //
    // Bằng cách lọc ra những người có id khác với id của user //

    const otherUsers = conver.participants.find((p) => p._id !== user._id)

    if(!otherUsers)  return null;

    const unreadCount = conver.unreadCounts[user._id]

    const lastMessage = conver.lastMessage?.content ?? "";  // Nếu không có giá trị thì trả chuỗi "" //
    const handleSelectConversation = async (id: string) => {
        setActiveConversation(id);
        if(!messages[id])
        {
            // Gọi hàm fetchMessages //
            await fetchMessages();
        }
    };

    // Logic xử lý phần hiển thị phần tin nhắn hiện lên ở DirectChatCard //
    const getLastMessageContent = () => {
        const message = conver.lastMessage;
        if(!message)     return "";

        let content = message.content;
        if(!content)
        {
            content = "Đã gửi ảnh"
        }

        const isOwnMessage = message.sender?._id.toString() === user?._id.toString();

        return isOwnMessage ? `You: ${content}` : content;
    }

    const displayLastMessage = getLastMessageContent();

    return <ChatCard
        converId={conver._id}
        name={otherUsers?.displayName ?? ""}
        timestamps={
            conver.lastMessage?.createdAt ? new Date(conver.lastMessage.createdAt): undefined
        }

        isActive = {activeConversationId === conver._id}
        onSelect={handleSelectConversation}
        unreadCount={unreadCount}
        leftSection= {
            <div>
                <UserAvatar 
                    type={"sidebar"} 
                    name={otherUsers.displayName ?? ""}
                    avatarURL={otherUsers.avatarUrl ?? undefined}                
                />
                {/* Sử dụng Socket.io ở đây để xác định online hay offline */}
                {/* <StatusBadge status={"online"}/> */}
                {OnlineUsers.includes(otherUsers._id) ? (
                    <StatusBadge status={"online"}/>
                ) : (
                    <StatusBadge status={"offline"}/>
                )
            }
                { unreadCount > 0 ? <UnreadCountBadge unreadCount={unreadCount} /> : null }
            </div>
        }

        subtitle={
            <p className={cn(
                "text-sm truncate",
                unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
            )}
        >
            {displayLastMessage}
        </p>

        }

    />
}

export default DirectMessageCard;