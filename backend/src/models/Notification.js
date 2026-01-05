import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    senderId: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: "User", required: true 
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    type: { 
        type: String, 
        enum: ["FRIEND_REQUEST", "FRIEND_ACCEPT"], // 2 loại thông báo chính //
        required: true 
    },

    // Để tính số lượng chưa đọc //
    isRead: { 
        type: Boolean, 
        default: false 
    }, 

    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FriendRequest",
        default: null
    },
}, { 
    timestamps: true 
   }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;