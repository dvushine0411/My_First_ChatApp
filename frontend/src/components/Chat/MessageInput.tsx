import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, X } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStores";
import { toast } from "sonner";

const MessageInput = ({ selectedConver }: { selectedConver: Conversation }) => {
    const { user } = useAuthStore();
    const {socket} = useSocketStore();
    const [value, setValue] = useState("");
    
    // State lưu ảnh và preview
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { sendDirectMessages, sendGroupMessages, activeConversationId } = useChatStore();

    if (!user) return null;

    // --- LOGIC XỬ LÝ FILE (Dùng chung cho cả Chọn file và Paste) ---
    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chỉ chọn file hình ảnh!");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string); // Để hiển thị ảnh nhỏ
            setFile(file); // Để gửi đi
        };
        reader.readAsDataURL(file);
    };

    // 1. Xử lý chọn ảnh từ nút bấm
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    // 2. Xử lý Paste ảnh (Ctrl + V)
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith("image/")) {
                e.preventDefault(); // Chặn paste text rác nếu là ảnh
                const pastedFile = item.getAsFile();
                if (pastedFile) processFile(pastedFile);
                break; // Chỉ lấy 1 ảnh
            }
        }
    };

    // 3. Xóa ảnh đang chọn
    const removeImage = () => {
        setImagePreview(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // 4. Gửi tin nhắn
    const sendMessage = async () => {
        if (!value.trim() && !file) return; // Không có chữ VÀ không có ảnh thì chặn

        try {
            if (selectedConver.type === "direct") {
                const recipient = selectedConver.participants.find((p) => p._id !== user._id);
                if (recipient) {
                    await sendDirectMessages(recipient._id, value, file || undefined);
                }
            } else {
                await sendGroupMessages(selectedConver._id, value, file || undefined);
            }
            
            // Reset sau khi gửi thành công
            setValue("");
            removeImage();
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            toast.error("Gửi tin nhắn thất bại.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (newValue.length === 0 && socket && activeConversationId) {
            socket.emit("Stop-typing", activeConversationId);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.key != "Enter")
        {
            console.log("CLIENT: Gửi typing cho phòng:", activeConversationId); // Log 1
            socket?.emit("typing", activeConversationId);
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
            socket?.emit("Stop-typing", activeConversationId);
        }
    };

    return (
        <div className="p-3 bg-background min-h-[56px]">
            {/* Hiển thị Preview ảnh */}
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative group">
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-20 h-20 object-cover rounded-md border border-border"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="hover:bg-primary/10 transition-smooth"
                >
                    <ImagePlus className={`size-4 ${imagePreview ? "text-primary" : ""}`} />
                </Button>

                <div className="flex-1 relative">
                    <Input
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste} // <--- Quan trọng: Bắt sự kiện Paste
                        value={value}
                        onChange={handleInputChange}
                        placeholder="Nhập tin nhắn..."
                        className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8 hover:bg-primary/10">
                            <EmojiPicker onChange={(emoji: string) => setValue(value + emoji)} />
                        </Button>
                    </div>
                </div>

                <Button
                    onClick={sendMessage}
                    className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
                    disabled={!value.trim() && !file}
                >
                    <Send className="size-4 text-white" />
                </Button>
            </div>
        </div>
    );
};

export default MessageInput;