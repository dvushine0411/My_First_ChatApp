export const updateConversationAfterMessage = (conversation, message, senderId) => {
    conversation.set({
        seenBy: [senderId],
        lastMessageAt: message.createdAt,
        lastMessage: {
            _id: message._id,
            content: message.content,
            senderId,
            createdAt: message.createdAt
        }
    })

    // Nếu mà userId chính là người gửi (senderId) thì unreadCounts = 0 nếu không thì tăng lên 1 (PrevCount + 1) //
    // Trong đó PrevCount là số tin nhắn chưa đọc (unreadCounts) trước đó //

    if(!conversation.unreadCounts)
    {
        conversation.unreadCounts = new Map();
    }

    conversation.participants.forEach((p) => {
        const MemberId = p.userId.toString();
        const isSender = MemberId === senderId.toString();
        const prevCount = conversation.unreadCounts.get(MemberId) || 0;
        conversation.unreadCounts.set(MemberId, isSender ? 0: prevCount + 1);

    });

    conversation.markModified('unreadCounts');
}

// Hàm này dùng để mỗi khi có 1 tin nhắn mới, nó sẽ emit ra tín hiệu cho frontend nhận để cập nhật giao diện //
// Cập nhật các phần như 

export const emitNewMessage = (io, conversation, message) => {
    io.to(conversation._id.toString()).emit("new-message", {
        message,
        conversation: {
            _id: conversation._id,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt
        },
        unreadCounts: conversation.unreadCounts
    });
    
}

