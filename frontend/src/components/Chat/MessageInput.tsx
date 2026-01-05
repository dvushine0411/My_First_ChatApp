import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";


const MessageInput = ({selectedConver} : {selectedConver: Conversation}) => {

    const {user} = useAuthStore();
    const [value, setValue] = useState("");

    const {sendDirectMessages, sendGroupMessages} = useChatStore();

    if(!user)   return;

    const sendMessage = async () => {
        if(!value.trim()) return;   // Hàm trim giúp cắt bỏ khoảng trắng ở đầu và cuối tin nhắn nếu người dùng nhập thừa khoảng trắng //

        try {
            if(selectedConver.type == "direct")
            {
                const participants = selectedConver.participants;
                const recipient = participants.filter((p) => p._id != user._id)[0];
                await sendDirectMessages(recipient._id, value);
            }
            else
            {
                await sendGroupMessages(selectedConver._id, value);
            }
            
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn: ", error);
            toast.error("Có lỗi khi gửi tin nhắn. Hãy thử lại!")
        } finally {
            setValue("");
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.key == "Enter")
        {
            e.preventDefault();
            sendMessage();
        }
        if(!value.trim())   return;
    }

    return (
        <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition-smooth"
            >
                <ImagePlus className="size-4"/>
            </Button>

            <div className="flex-1 relative">
                <Input
                    onKeyDown={handleKeyDown}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Nhập tin nhắn ..."
                    className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
                >

                </Input>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-primary/10 transition-smooth"
                        
                        >
                            <EmojiPicker onChange={(emoji: string) => setValue(`${value}${emoji}`)}/>
                        </Button>            
                </div>
            </div>
            <Button 
                onClick={sendMessage}
                className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105" 
                disabled={!value.trim()}>
                <Send className="size-4 text-white"/>
            </Button>

        </div>

    )
}

export default MessageInput;