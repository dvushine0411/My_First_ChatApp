import jwt from 'jsonwebtoken';
// 👇 Đảm bảo tên file đúng 100% (User.js hay Users.js)
import User from '../models/Users.js'; 

export const SocketMiddleware = async (socket, next) => {
    // Log 1: Báo hiệu có kết nối mới chui vào middleware
    console.log(`--- [Socket Middleware] New Connection: ${socket.id} ---`);

    try {
        // 1. Lấy token
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
        
        // Log 2: Kiểm tra xem token có null không
        console.log("Token received:", token ? "Yes (Có token)" : "No (Rỗng)");

        if(!token) {
            return next(new Error("Unauthorized - Client chưa gửi Token"));
        }

        // 2. Giải mã Token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Log 3: Xem bên trong token có gì (Quan trọng: check xem key là userId hay _id)
        console.log("Decoded Token:", decoded);

        // 👇 Kiểm tra xem biến dùng để query là userId hay _id
        const idToQuery = decoded.userID || decoded._id; 

        if (!idToQuery) {
            return next(new Error("Unauthorized - Token không chứa ID user"));
        }

        // 3. Tìm User trong DB
        // Log 4: Bắt đầu tìm user
        console.log(`Đang tìm user với ID: ${idToQuery}...`);

        const user = await User.findById(idToQuery).select("-hashedPassword");

        if(!user) {
            console.log("Không tìm thấy user trong DB");
            return next(new Error("Người dùng không tồn tại"));
        }

        // 4. Gắn user và cho qua
        socket.user = user;

        next(); 

    } catch (error) {
        // Log lỗi chi tiết nếu bị kẹt
        console.error("Lỗi tại Middleware:", error.message);
        
        // Trả lỗi về cho client biết
        next(new Error("Unauthorized")); 
    }
}