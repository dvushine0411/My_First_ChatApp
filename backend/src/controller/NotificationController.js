import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiverId: req.user._id })
            .sort({ createdAt: -1 }) // Mới nhất lên đầu
            .populate("senderId", "displayName avatarURL");
        
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy thông báo" });
    }
};

export const markRead = async (req, res) => {
    try {
        // Đánh dấu tất cả là đã đọc (khi bấm vào chuông)
        await Notification.updateMany(
            { receiverId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: "Đã đọc hết" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi update" });
    }
};