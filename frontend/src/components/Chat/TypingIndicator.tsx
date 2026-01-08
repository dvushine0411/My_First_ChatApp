import { cn } from "@/lib/utils";

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 items-end mb-2 mt-1 px-4">
        {/* Bong bóng chứa 3 dấu chấm */}
        <div className={cn(
            "p-3 px-4 rounded-2xl rounded-tl-none", // Bo góc kiểu Messenger (nhọn góc trái dưới)
            "bg-secondary text-secondary-foreground", // Màu nền xám (giống tin nhắn người khác)
            "flex items-center gap-1 h-10 w-fit shadow-sm"
        )}>
            {/* Dấu chấm 1 */}
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            {/* Dấu chấm 2 */}
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            {/* Dấu chấm 3 */}
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
        </div>
        
        {/* Text nhỏ hiển thị ai đang gõ (Tuỳ chọn) */}
        <span className="text-xs text-muted-foreground animate-pulse">Typing...</span>
    </div>
  );
};

export default TypingIndicator;