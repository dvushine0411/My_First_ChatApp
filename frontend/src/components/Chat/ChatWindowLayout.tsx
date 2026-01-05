import WelcomeScreen from "./WelcomeScreen";
import { useChatStore } from "@/stores/useChatStore";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import MessageInput from "./MessageInput";
import ChatWindowBody from "./ChatWindowBody";
import { useEffect } from "react";

const ChatWindowLayout = () => {

    const {activeConversationId, conversations, messageLoading: loading, messages, markAsSeen} = useChatStore();

    const selectedConver = conversations.find((c) => c._id == activeConversationId) ?? null;

    useEffect(() => {
        if(!selectedConver)
        {
            return;
        }

        const markSeen = async () => {
            try {
                await markAsSeen();
                
            } catch (error) {
                console.error("Lỗi khi markSeen", error);
            }   
        }

        markSeen();

    }, [selectedConver, markAsSeen])

    if(!selectedConver)
    {
        return <WelcomeScreen/> 
    }

    if(loading)
    {
        return <ChatWindowSkeleton/>
    }
    return (

        <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
            {/* Header */}
            
            <ChatWindowHeader/>

            {/* Body */}

            <div className="flex-1 overflow-y-auto bg-primary-foreground">
                <ChatWindowBody/>
            </div>

            {/* Footer */}

            <MessageInput 
                selectedConver={selectedConver}
            />

        </SidebarInset>
        
    )
}

export default ChatWindowLayout;