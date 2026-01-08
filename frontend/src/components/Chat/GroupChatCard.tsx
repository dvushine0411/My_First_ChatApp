import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { cn } from "@/lib/utils";
import UnreadCountBadge from "./unreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";

const GroupChatCard = ({conver}: {conver: Conversation}) => {
    const {user} = useAuthStore();
    const {activeConversationId, setActiveConversation, messages, fetchMessages} = useChatStore();

    if(!user) return null;

    const unreadCount = conver.unreadCounts[user._id];

    const Groupname = conver.group?.name ?? "";

    const handleSelectConversation = async (id: string) => {
        setActiveConversation(id);
        if(!messages[id])
        {
            // Gọi đến hàm fetchMessages
            await fetchMessages();
        }

    }

    const getLastMessageContent = () => {
        const message = conver.lastMessage;

        if(!message)     return;

        let content = message.content;

        if(!content)
        {
            content = "Đã gửi ảnh";
        }

        const senderData = message.sender || (message as any).senderId;

        const senderId = typeof senderData === 'object' && senderData != null
            ? senderData._id
            : senderData;

        const isOwnMessage = senderId?.toString() === user._id.toString();

        return isOwnMessage ? `You: ${content}` : content;

    }

    const displayLastMessage = getLastMessageContent();

    return <ChatCard
        converId={conver._id}
        name={Groupname}
        timestamps={
            conver.lastMessage?.createdAt ? new Date(conver.lastMessage.createdAt): undefined
        }
        isActive={activeConversationId === conver._id}
        onSelect={handleSelectConversation}
        unreadCount={unreadCount}
        leftSection= {
            <div>
                {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount}/>}
                <GroupChatAvatar 
                    participants={conver.participants} 
                    type="chat"              
                />

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


export default GroupChatCard;