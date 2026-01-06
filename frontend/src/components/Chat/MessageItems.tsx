import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";


interface MessageItemsProps {
    message: Message;
    index: number
    messages: Message[]
    selectedConver: Conversation
    lastMessageStatus?: "delivered" | "seen"

}

const MessageItems = ({message, index, messages, selectedConver, lastMessageStatus}: MessageItemsProps) => {
    const prev = messages[index - 1];

    const isGroupBreak = index == 0 || (message.senderId != prev?.senderId) ||
        (new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() >= 300000) // Tức là 5 phút //

    const participant = selectedConver.participants.find((p: Participant) => p._id.toString() == message.senderId.toString());


    return (
        <div className={cn("flex flex-col mb-1", message.isOwn ? "items-end" : "items-start", isGroupBreak ? "mt-6" : "mt-1")}>
            <div className={cn("flex gap-2 items-center max-w-full", message.isOwn ? "flex-row-reverse" : "flex-row")}>
                
                {/* Hiển thị Avatar */}
                {!message.isOwn && (
                    <div className="w-8">
                        {isGroupBreak && (
                            <UserAvatar 
                                type={"chat"} 
                                name={participant?.displayName ?? "VIT"}
                                avatarURL={participant?.avatarUrl ?? undefined}                      
                            />
                        )}
                    </div>
                )}

                {/* Hiển thị tin nhắn */}
                <div className={cn("max-w-xs lg:max-w-md space-y-1 flex flex-col", message.isOwn ? "items-end" : "items-start")}>
                    {/* PHẦN 1: ẢNH (Nằm riêng, không có Card bọc, không có nền tím) */}
                    {message.imgUrl && (
                        <div className="mb-1"> {/* mb-1 để tạo khoảng cách nhỏ nếu có cả text bên dưới */}
                            <img 
                                src={message.imgUrl} 
                                alt="Attachment" 
                                className={cn(
                                    "max-h-[300px] w-auto object-cover rounded-xl border border-gray-200/30", 
                                    // Nếu muốn bo góc kiểu messenger (tròn hơn): rounded-2xl
                                )}
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* PHẦN 2: TEXT (Chỉ hiển thị Card/Bong bóng tím khi có nội dung text) */}
                    {message.content && (
                        <Card className={cn(
                            "p-3 px-4", // Padding chuẩn cho text
                            message.isOwn ? "chat-bubble-sent border-0 text-white" : "bg-chat-bubble-recieved"
                        )}>
                            <p className="text-sm leading-relaxed break-words">
                                {message.content}
                            </p>
                        </Card>
                    )}
                </div>

                {/* Hiển thị thời gian */}
                {isGroupBreak && (
                    <span className="text-xs text-muted-foreground px-1 whitespace-nowrap">
                        {formatMessageTime(new Date(message.createdAt))}
                    </span>
                )}
            </div>

            {/* Hiển thị status */}
            {message.isOwn && message._id == selectedConver.lastMessage?._id && (
                <div className="px-1"> 
                    <Badge className={cn(
                        "text-xs px-0 py-0.5 h-auto border-0 bg-transparent", 
                        lastMessageStatus == 'seen' ? "text-primary" : "text-muted-foreground"
                    )}>
                        {lastMessageStatus}
                    </Badge>
                </div>
            )}

        </div>
    )

}

export default MessageItems;