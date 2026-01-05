import User from "../models/Users.js";
import jwt from 'jsonwebtoken';

export const ProtectedRoute = async (req, res, next) => {
    try {

        // Lấy token từ header //

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer <token> tức là lấy xâu token ở sau chữ Bearer //

        if(!token)
        {
            return res.status(401).json({
                message: "Không tìm thấy access token"
            })
        }

        // Xác nhận token hợp lệ //

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if(err)
            {
                console.error(err);
                return res.status(403).json({
                    message: "Access hết hạn hoặc không đúng"   
                })
            }

        // Tìm user //

        const user = await User.findById(decodedUser.userID).select("-hashedPassword");

        if(!user)
        {
            return res.status(403).json({
                message: "Người dùng không tồn tại"
            })
        }

        // Trả về user trong req //
        req.user = user;
        next();
    });

    } catch (error) {
        console.error("Lỗi khi xác minh JWT trong authMiddleWare", error);
        console.error("LỖI 500 cụ thể là");
        console.error(error.message);
        // console.error(error.stack);

        return res.status(500).json({
            message: "Lỗi hệ thống",
            error: error.message
        })
        
    }

}