import { useChatStore } from "@/stores/useChatStore";
import WelcomScreen from "./WelcomeScreen";
import { useEffect, useRef, useState } from "react";
import MessageItems from "./MessageItems";
import TypingIndicator from "./TypingIndicator";

const ChatWindowBody = () => {
    const { 
        activeConversationId, 
        conversations, 
        messages: allMessages, 
        fetchMessages, 
        isTyping // Lấy biến này để trigger scroll
    } = useChatStore();

    const [lastMessageStatus, setlastMessageStatus] = useState<"delivered" | "seen">("delivered");

    const SelectedConver = conversations.find((c) => c._id === activeConversationId);

    // 1. Fetch messages
    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId);
        }
    }, [activeConversationId, fetchMessages]);

    // 2. Logic check Seen/Delivered
    useEffect(() => {
        const lastMessage = SelectedConver?.lastMessage;
        if (!lastMessage) return;

        const seenBy = SelectedConver?.seenBy ?? [];
        // console.log(`Số lượng người đã xem tin nhắn là: ${seenBy.length}`);
        
        // Logic: Nếu danh sách seenBy > 1 (có cả mình và người kia) => Seen
        // Nếu chỉ có 1 (chỉ mình gửi và tự xem) => Delivered
        setlastMessageStatus(seenBy.length > 1 ? "seen" : "delivered");

    }, [SelectedConver]);

    const messages = allMessages[activeConversationId!]?.items ?? [];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 3. Hàm scroll xuống đáy
    const scrollToBottom = () => {
        // Dùng timeout nhỏ để đảm bảo DOM đã render xong mới scroll
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 10);
    };

    // 4. FIX SCROLL: Scroll khi có tin nhắn mới HOẶC khi đối phương đang gõ
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]); // <--- Thêm isTyping vào đây

    // --- RENDER ---

    if (!SelectedConver) {
        return <WelcomScreen />;
    }

    // FIX LỖI: Bỏ đoạn return sớm if(!messages.length) ở đây.
    // Vì nếu chưa có tin nhắn mà người ta gõ, mình vẫn phải render khung chat để hiện TypingIndicator.

    return (
        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden beautiful-scrollbar space-y-4">
                
                {/* Case 1: Chưa có tin nhắn nào */}
                {messages.length === 0 && !isTyping && (
                    <div className="flex flex-1 h-full items-center justify-center text-muted-foreground opacity-50">
                        <p>Chưa có tin nhắn nào trong cuộc hội thoại này</p>
                    </div>
                )}

                {/* Case 2: Render danh sách tin nhắn */}
                {messages.map((message, index) => (
                    <MessageItems
                        key={message._id ?? index}
                        message={message}
                        index={index}
                        messages={messages}
                        selectedConver={SelectedConver}
                        lastMessageStatus={lastMessageStatus}
                    />
                ))}

                {/* Case 3: Hiển thị Typing Indicator */}
                {isTyping && (
                    <div className="fade-in-up w-full">
                        <TypingIndicator />
                    </div>
                )}
                
                {/* Div neo để scroll xuống */}
                <div ref={messagesEndRef} className="h-1" />
            </div>
        </div>
    );
};

export default ChatWindowBody;