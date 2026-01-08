import { cn } from "@/lib/utils";

// 1. Tạo component Skeleton riêng với style "Mây trôi"
const CloudSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse bg-gray-100 dark:bg-zinc-800", // Màu sắc mây nhẹ
      className
    )}
    {...props}
  />
);

const ChatWindowSkeleton = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black">
      
      {/* === HEADER: Trắng tinh khôi, icon tròn === */}
      <div className="h-[72px] px-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <CloudSkeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
          <div className="space-y-2">
            <CloudSkeleton className="h-4 w-32 rounded-full" /> {/* Tên */}
            <CloudSkeleton className="h-3 w-20 rounded-full opacity-60" /> {/* Status */}
          </div>
        </div>
        <div className="flex gap-3">
            <CloudSkeleton className="h-9 w-9 rounded-full" />
            <CloudSkeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* === MESSAGE LIST: Bong bóng tròn trịa như mây === */}
      <div className="flex-1 p-4 space-y-8 overflow-hidden flex flex-col justify-end">
        
        {/* Tin nhắn CỦA HỌ (Bên trái) */}
        <div className="flex items-end gap-2 max-w-[70%]">
            <CloudSkeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
            <div className="space-y-1.5 w-full">
                {/* rounded-3xl tạo cảm giác rất mềm */}
                <CloudSkeleton className="h-10 w-[140px] rounded-3xl rounded-bl-lg" />
            </div>
        </div>

        <div className="flex items-end gap-2 max-w-[70%]">
            <CloudSkeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
            <div className="space-y-1.5 w-full">
                <CloudSkeleton className="h-20 w-[260px] rounded-3xl rounded-bl-lg" />
            </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[70%]">
            <CloudSkeleton className="h-10 w-[180px] rounded-3xl rounded-br-lg bg-gray-200/60 dark:bg-zinc-700" />
        </div>

        <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[70%]">
            <CloudSkeleton className="h-44 w-60 rounded-2xl rounded-br-lg bg-gray-200/60 dark:bg-zinc-700" />
        </div>
        
        {/* Tin mới nhất (Đang gõ...) */}
        <div className="flex items-end gap-2 max-w-[70%]">
            <CloudSkeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
            <CloudSkeleton className="h-12 w-[120px] rounded-3xl rounded-bl-lg" />
        </div>

      </div>

      {/* INPUT: Thanh dài bo tròn (Pill) */}
      <div className="p-3 px-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
        <div className="flex items-center gap-3">
            <div className="flex gap-2">
                <CloudSkeleton className="h-7 w-7 rounded-full" />
                <CloudSkeleton className="h-7 w-7 rounded-full" />
            </div>
            
            <div className="flex-1">
                 <CloudSkeleton className="h-10 w-full rounded-full bg-gray-100 dark:bg-zinc-800" />
            </div>

            <CloudSkeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  )
};

export default ChatWindowSkeleton;