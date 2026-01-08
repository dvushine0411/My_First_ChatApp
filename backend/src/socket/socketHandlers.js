import { getUserConversationsforSocketIO } from "../controller/ConversationController.js";

// Tính năng 0: Đưa người dùng vào các room (conversationId) //

export const addUserToRoom = async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    try {
        const conversationIds = await getUserConversationsforSocketIO(userId);
        socket.join(userId);
        conversationIds.forEach((id) => {
            socket.join(id);
        });

        socket.on('join-conversation', (conversationId) => {
            socket.join(conversationId);
        })

        socket.on("typing", (conversationId) => {
            console.log("SERVER: Nhận typing từ user, đang gửi đến phòng:", conversationId); // Log 2
            socket.to(conversationId).emit("typing", conversationId);
        })

        socket.on("Stop-typing", (conversationId) => {
            socket.to(conversationId).emit("Stop-typing", conversationId);
        })
        console.log(`User ${user.displayName} đã join ${conversationIds.length} phòng chat`);
    } catch (error) {
        console.error(`Lỗi khi join room cho user ${user.displayName} `, error);
        
    }

}

// Kết thúc tính năng 0 //


// Tính năng 1: Cập nhật trạng thái Online của từng Users //

const OnlineUsers = new Map();

/// 1. Xử lý khi người dùng online //
export const handlerUserConnect = (io, socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    console.log(`${user.displayName} online - socketId ${socket.id}`);

    OnlineUsers.set(userId, socket.id);

    io.emit("online-users", Array.from(OnlineUsers.keys()));
};

/// 2. Xử lý khi người dùng offline //

export const removeUserFromOnline = (io, socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    OnlineUsers.delete(userId);

    io.emit("online-users", Array.from(OnlineUsers.keys()));

}

// Kết thúc tính năng 1 //


// Tính năng 3: Xử lý phần gửi tin nhắn //

export const emitNewMessage = (io, conversation, message) => {
    io.to(conversation._id.toString()).emit("new-message", {
        message,
        conversation: {
            _id: conversation._id,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            seenBy: conversation.seenBy
        },
        unreadCounts: conversation.unreadCounts
    });

}

// Kết thúc tính năng 3 //




