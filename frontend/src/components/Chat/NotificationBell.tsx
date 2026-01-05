import { useEffect, useState } from "react";
import { Bell, UserPlus, Check } from "lucide-react"; // Icon
import { formatOnlineTime } from "@/lib/utils";

import { DropdownMenu,DropdownMenuContent,DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 

import { useNotificationStore } from "@/stores/useNotificationStore";

const NotificationBell = () => {
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAllAsRead, 
        acceptFriendRequest, 
        declineFriendRequest 
    } = useNotificationStore();

    const [isOpen, setIsOpen] = useState(false);

    // Load thông báo khi component hiện lên
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Xử lý khi mở menu
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) {
            // Đánh dấu đã đọc khi mở ra
            markAllAsRead();
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            {/* --- CÁI CHUÔNG --- */}
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    
                    {/* Badge số lượng (Chấm đỏ) */}
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>  

            {/* --- NỘI DUNG XỔ XUỐNG --- */}
            <DropdownMenuContent
                side="right" 
                align="start"
                sideOffset={15}
                className="w-80 sm:w-96 p-0 shadow-lg border-gray-200 dark:border-gray-800 z-50"
            >
                <div className="p-4 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Thông báo</h3>
                    {unreadCount > 0 && (
                         <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                            {unreadCount} mới
                         </span>
                    )}
                </div>
                <DropdownMenuSeparator />
                
                {/* Khu vực cuộn danh sách */}
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                            <Bell className="w-10 h-10 opacity-20" />
                            <p className="text-sm">Không có thông báo nào</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif._id} 
                                className={`
                                    relative p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                                    ${!notif.isRead ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}
                                `}
                            >
                                <div className="flex gap-3">
                                    {/* Avatar người gửi */}
                                    <div className="relative">
                                        <Avatar className="w-10 h-10 border border-gray-200">
                                            <AvatarImage src={notif.senderId?.avatarURL || ""} className="object-cover" />
                                            <AvatarFallback>{notif.senderId?.displayName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Icon nhỏ góc avatar */}
                                        {notif.type === "FRIEND_REQUEST" ? (
                                             <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[3px] border-2 border-white dark:border-gray-900 text-white">
                                                <UserPlus size={10} />
                                             </div>
                                        ) : (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[3px] border-2 border-white dark:border-gray-900 text-white">
                                                <Check size={10} />
                                             </div>
                                        )}
                                    </div>

                                    {/* Nội dung text */}
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">
                                            <span className="font-bold hover:underline cursor-pointer">
                                                {notif.senderId?.displayName}
                                            </span>
                                            {" "}
                                            {notif.type === "FRIEND_REQUEST" 
                                                ? "đã gửi cho bạn một lời mời kết bạn." 
                                                : "đã chấp nhận lời mời kết bạn của bạn."}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatOnlineTime(new Date(notif.createdAt))}
                                        </p>
                                        
                                        {/* --- ACTION BUTTONS (Đồng ý / Từ chối) --- */}
                                        {notif.type === "FRIEND_REQUEST" && notif.requestId && (
                                            <div className="flex gap-2 mt-2">
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                    onClick={(e) => {
                                                        // Ngăn sự kiện click lan ra ngoài làm đóng menu
                                                        e.stopPropagation(); 
                                                        acceptFriendRequest(notif._id, notif.requestId!);
                                                    }}
                                                >
                                                    Đồng ý
                                                </Button>
                                                
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="h-8 px-4 text-gray-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        declineFriendRequest(notif._id, notif.requestId!);
                                                    }}
                                                >
                                                    Từ chối
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chấm xanh chưa đọc */}
                                    {!notif.isRead && (
                                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
                
                {/* Footer (nếu cần) */}
                {notifications.length > 0 && (
                    <div className="p-2 border-t text-center bg-gray-50 dark:bg-gray-900 rounded-b-md">
                        <Button variant="link" className="text-xs text-muted-foreground h-auto p-0">
                            Xem tất cả thông báo
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;