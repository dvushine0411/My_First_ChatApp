import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "@radix-ui/react-separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStores";


const ChatWindowHeader = ({chat}: {chat?: Conversation}) => {
    const {conversations, activeConversationId} = useChatStore();
    const {user} = useAuthStore();
    const {OnlineUsers} = useSocketStore();

    chat = chat ?? conversations.find((c) => c._id == activeConversationId)

    if(!chat)
    {
        return (
            <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
                <SidebarTrigger className="-ml-1 text-foreground"/>
            </header>
        )
    }

    let otherUser;

    if(chat.type == 'direct')
    {
        const otherUsers = chat.participants.filter((p) => p._id != user?._id);
        otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
        if(!user && !otherUser)   return;
    }

    return (
        <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
            <div className="flex items-center gap-2 w-full">
                <SidebarTrigger className="-ml-1 text-foreground"/>
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />

                <div className="p-2 w-full flex items-center gap-3">
                    {/* Phần avatar */}
                    <div className="relative">
                        {
                            chat.type == 'direct' ? (
                                <div>
                                    <UserAvatar 
                                        type={"sidebar"} 
                                        name={otherUser?.displayName || ""}
                                        avatarURL={otherUser?.avatarUrl || undefined}
                                    />
                                    {/* Sử dụng socket.io để xác định online hay offline */}
                                    {OnlineUsers.includes(otherUser?._id ?? "") ? (
                                        <StatusBadge status={"online"}/>
                                    ) : (
                                        <StatusBadge status="offline"/>
                                    )
                                }
                                </div>

                            ) : (
                                <div className="relative">
                                    <GroupChatAvatar 
                                        participants={chat.participants} 
                                        type={"sidebar"}                                                            
                                    />
                                </div>
                            )
                        }
                    </div>
                    {/* Phần tên conversation */}
                    <h2 className="font-semibold text-foreground">
                        {
                            chat.type == 'direct' ? otherUser?.displayName : chat.group?.name
                        }

                    </h2>

                </div>
            </div>
        </header>
    )
}

export default ChatWindowHeader;