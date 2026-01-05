import express from 'express';
import { getNotifications, markRead } from "../controller/NotificationController.js"; // Import controller bạn đã viết

const router = express.Router();

// 1. API lấy danh sách tất cả các thông báo
// Frontend gọi: axios.get("/notifications")
router.get("/",  getNotifications);

// 2. API đánh dấu đã đọc tất cả thông báo (khi bấm vào chuông)
// Frontend gọi: axios.put("/notifications/read")
router.put("/read", markRead);

export default router;