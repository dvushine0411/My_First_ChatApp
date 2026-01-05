import { useChatStore } from "@/stores/useChatStore";
import WelcomScreen from "./WelcomeScreen";
import { useEffect, useRef, useState } from "react";
import MessageItems from "./MessageItems";


const ChatWindowBody = () => {
    const {activeConversationId, conversations, messages: allMessages, fetchMessages} = useChatStore();

    const [lastMessageStatus, setlastMessageStatus] = useState<"delivered" | "seen">("delivered");

    const SelectedConver = conversations.find((c) => c._id == activeConversationId);

    useEffect(() => {
        if(activeConversationId) {
             fetchMessages(activeConversationId);
        }
    }, [activeConversationId, fetchMessages]);


    useEffect(() => {
        const lastMessage = SelectedConver?.lastMessage;
        if(!lastMessage)
        {
            return;
        }

        const seenBy = SelectedConver?.seenBy ?? [];

        console.log(`Số lượng người đã xem tin nhắn là: ${seenBy.length}`);

        setlastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");

    }, [SelectedConver])

    const messages = allMessages[activeConversationId!]?.items ?? [];

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if(!SelectedConver)
    {
        return <WelcomScreen/>
    }

    if(!messages.length)
    {
        return (
        <div className="flex h-full items-center justify-center text-muted-foregrounđ">
            Chưa có tin nhắn nào trong cuộc hội thoại này
        </div>
        )
    }

    return (

        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div className="flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
                {messages.map((message, index) => {
                    return (
                        <MessageItems 
                            key={message._id ?? index}
                            message={message} 
                            index={index} 
                            messages={messages} 
                            selectedConver={SelectedConver} 
                            // 5. Truyền biến động lastMessageStatus vào đây //
                            lastMessageStatus={lastMessageStatus}
                        />
                    )
                })}
                <div ref={messagesEndRef}/>
            </div>

        </div>
    )
}

export default ChatWindowBody;