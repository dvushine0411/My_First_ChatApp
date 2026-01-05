import User from "../models/Users.js";

export const AuthMe = async (req, res) => {
    try {
        const user = req.user;  // Lấy từ MiddleWare //

        return res.status(200).json({
            user
        });

    } catch (error) {
        console.error("Lỗi khi gọi AuthMe", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        })
    }
}

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const currentUserId = req.user._id;

        if (!q) {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                {
                    $or: [
                        { username: { $regex: q, $options: "i" } },
                        { displayName: { $regex: q, $options: "i" } },
                        { email: { $regex: q, $options: "i" } }
                    ]
                }
            ]
        }).select("_id username displayName avatarURL").limit(10);

        return res.status(200).json({ users });

    } catch (error) {
        console.error("Lỗi khi tìm kiếm user", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}