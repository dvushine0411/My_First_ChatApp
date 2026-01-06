import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Badge } from "../ui/badge";

interface MessageItemsProps {
    message: Message;
    index: number;
    messages: Message[];
    selectedConver: Conversation;
    lastMessageStatus?: "delivered" | "seen";
}

const MessageItems = ({ message, index, messages, selectedConver, lastMessageStatus }: MessageItemsProps) => {
    const prev = messages[index - 1];

    // Logic kiểm tra để ngắt nhóm tin nhắn
    const isGroupBreak = index === 0 || (message.senderId !== prev?.senderId) ||
        (new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() >= 300000); // 5 phút

    const participant = selectedConver.participants.find((p: Participant) => p._id.toString() === message.senderId.toString());

    // Check xem đây có phải tin nhắn cuối cùng để hiện status không
    const isLastMessage = message._id === selectedConver.lastMessage?._id;

    return (
        <div className={cn(
            "flex flex-col mb-1", 
            message.isOwn ? "items-end" : "items-start", 
            isGroupBreak ? "mt-6" : "mt-1"
        )}>
            {/* CONTAINER CHÍNH: AVATAR + NỘI DUNG MESSAGE */}
            <div className={cn("flex gap-2 max-w-full", message.isOwn ? "flex-row-reverse" : "flex-row")}>
                
                {/* 1. Hiển thị Avatar (Chỉ hiện khi không phải tin mình) */}
                {!message.isOwn && (
                    <div className="w-8 flex flex-col justify-end"> {/* justify-end để avatar nằm dưới cùng nhóm */}
                        {isGroupBreak ? (
                            <UserAvatar 
                                type={"chat"} 
                                name={participant?.displayName ?? "VIT"}
                                avatarURL={participant?.avatarUrl ?? undefined}                      
                            />
                        ) : (
                            <div className="w-8" /> // Giữ chỗ nếu không hiện avatar
                        )}
                    </div>
                )}

                {/* 2. Cột chứa: Ảnh + (Text & Giờ) */}
                <div className={cn("flex flex-col max-w-xs lg:max-w-md", message.isOwn ? "items-end" : "items-start")}>
                    
                    {/* A. ẢNH (Luôn nằm trên cùng của khối) */}
                    {message.imgUrl && (
                        <div className="mb-1">
                            <img 
                                src={message.imgUrl} 
                                alt="Attachment" 
                                className={cn(
                                    "max-h-[300px] w-auto object-cover rounded-xl border border-gray-200/30",
                                )}
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* B. TEXT + THỜI GIAN (Xếp hàng ngang) */}
                    <div className={cn(
                        "flex items-end gap-2", // items-end để giờ nằm dưới đáy dòng
                        message.isOwn ? "flex-row-reverse" : "flex-row" // Đảo chiều nếu là tin mình để giờ nằm bên trái bong bóng
                    )}>
                        
                        {/* Text Bubble */}
                        {message.content && (
                            <div className={cn(
                                "p-3 px-4 text-sm leading-relaxed break-words shadow-sm",
                                "rounded-2xl",
                                message.isOwn 
                                    ? "bg-primary text-primary-foreground rounded-tr-sm dark:text-white" 
                                    : "bg-secondary text-secondary-foreground rounded-tl-sm"
                            )}>
                                <p>{message.content}</p>
                            </div>
                        )}

                        {/* Thời gian (Chỉ hiện khi group break HOẶC là tin cuối, tùy bạn chỉnh logic) */}
                        {isGroupBreak && (
                            <span className={cn(
                                "text-[11px] text-muted-foreground whitespace-nowrap mb-1", // mb-1 để căn chỉnh đẹp với đáy bubble
                                message.isOwn ? "mr-1" : "ml-1"
                            )}>
                                {formatMessageTime(new Date(message.createdAt))}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. STATUS (SEEN/DELIVERED) - Nằm dưới cùng, tách biệt */}
            {message.isOwn && isLastMessage && (
                <div className="mt-1 px-1"> 
                    <Badge className={cn(
                        "text-[12px] px-0 py-0 h-auto border-0 bg-transparent font-normal", 
                        lastMessageStatus === 'seen' 
                        ? "text-primary dark:text-white" 
                        : "text-muted-foreground"
                    )}>
                        {lastMessageStatus}
                    </Badge>
                </div>
            )}
            
        </div>
    );
}

export default MessageItems;