import Friend from "../models/Friend.js";
import User from "../models/Users.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";
import { io } from "../socket/socket.js"; 
import Conversation from "../models/Conversation.js";


export const addFriend = async (req, res) => {
    try {
        const {To_User, message} = req.body;
        const From_User = req.user._id;

        if(From_User.toString() === To_User.toString())
        {
            return res.status(400).json({
                message: "Không thể tự kết bạn với chính mình"
            })
        }

        const UserExists = await User.exists({_id: To_User});

        if(!UserExists)
        {
            return res.status(404).json({
                message: "Người dùng không tồn tại"
            })
        }

        // Sắp xếp ID để kiểm tra trong bảng Friend (tránh trùng lặp A-B và B-A)
        let UserA = From_User.toString();
        let UserB = To_User.toString();
        if(UserA > UserB)
        {
            [UserA, UserB] = [UserB, UserA];
        }

        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({UserA, UserB}),
            FriendRequest.findOne({
                $or: [
                    {From_User, To_User},
                    {From_User: To_User, To_User: From_User}
                ]
            })
        ])
        
        if(alreadyFriends)
        {
            return res.status(400).json({
                message: "Hai người đã là bạn bè"
            })
        }
        if(existingRequest)
        {
            return res.status(400).json({
                message: "Lời mời đã được gửi từ trước đó"
            })
        }

        // 1. Tạo Friend Request
        const request = await FriendRequest.create({From_User, To_User, message});


        // 2. Tạo Notification
        const newNotification = await Notification.create({
            senderId: From_User,    // Người gửi là mình
            receiverId: To_User,    // Người nhận là To_User
            type: "FRIEND_REQUEST", 
            requestId: request._id // Lưu id của friendrequest vào //

        });

        // 3. Populate thông tin người gửi để hiển thị đẹp trên UI
        const notifyData = await newNotification.populate("senderId", "displayName avatarURL");

        // 4. Bắn Socket cho người nhận (To_User)
        io.to(To_User.toString()).emit("new-notification", notifyData);

        return res.status(201).json({message: "Gửi lời mời kết bạn thành công", request});

    } catch (error) {
        console.error("Lỗi khi yêu cầu gửi kết bạn", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        })
        
    }

};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const UserId = req.user._id; // Người đang bấm chấp nhận (Mình - receiver)

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại" });
        }

        if (request.To_User.toString() != UserId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền chấp nhận lời mời này" });
        }

        // --- Logic Xử lý Bạn bè & Notification cũ (Giữ nguyên) ---
        let uA = request.From_User.toString();
        let uB = request.To_User.toString();
        if (uA > uB) [uA, uB] = [uB, uA];

        const friend = await Friend.create({ userA: uA, userB: uB });
        await FriendRequest.findByIdAndDelete(requestId);

        const From_User_Info = await User.findById(request.From_User).select("_id displayName avatarURL").lean();

        await Notification.findOneAndDelete({
            requestId: requestId,
            type: "FRIEND_REQUEST",
            receiverId: UserId
        });

        const newNotification = await Notification.create({
            senderId: UserId,
            receiverId: request.From_User,
            requestId: request._id,
            type: "FRIEND_ACCEPT"
        });

        const notifyData = await newNotification.populate("senderId", "displayName avatarURL");
        
        // Gửi socket thông báo (Giữ nguyên)
        io.to(request.From_User.toString()).emit("new-notification", notifyData);
        
        const senderId = request.From_User; // Người gửi lời mời
        const receiverId = UserId;          // Mình

        // 1. Tìm xem đã tồn tại cuộc trò chuyện hay chưa (Logic từ createConversation)
        let conversation = await Conversation.findOne({
            type: 'direct',
            "participants.userId": { $all: [senderId, receiverId] }
        });

        if (conversation) {
            // Nếu ĐÃ CÓ: Cập nhật thời gian để nó hiện lên đầu (Logic bổ sung)
            conversation.lastMessageAt = new Date();
            await conversation.save();
        } else {
            // Nếu CHƯA CÓ: Tạo mới (Copy y hệt từ createConversation)
            conversation = await Conversation.create({
                type: 'direct',
                participants: [
                    { userId: senderId }, // ID người gửi
                    { userId: receiverId } // ID người nhận (mình)
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map()
            });
            await conversation.save();
        }

        // 2. Populate (Copy y hệt từ createConversation)
        if (conversation) {
            await conversation.populate([
                { path: "participants.userId", select: "displayName avatarURL" },
                { path: "seenBy", select: "displayName avatarURL" },
                { path: "lastMessage.senderId", select: "displayName avatarURL" }
            ]);
        }

        // 3. Format dữ liệu participants (Copy y hệt từ createConversation)
        const participants = (conversation.participants || []).map((p) => ({
            _id: p.userId?._id,
            displayName: p.userId?.displayName,
            avatarURL: p.userId?.avatarURL,
            joinedAt: p.userId?.joinedAt
        }));

        // 4. Tạo object formatted (Copy y hệt từ createConversation)
        const formatted = { ...conversation.toObject(), participants };

        // 5. Emit Socket "new-conversation"
        // Lưu ý: createConversation dùng "new-group", nhưng ở đây là direct nên ta dùng
        // event chung là "new-conversation" (hoặc "new-group" nếu frontend bạn dùng chung 1 tên)
        
        // Gửi cho người kia
        io.to(senderId.toString()).emit("new-conversation", formatted);
        
        // Gửi cho chính mình (để hiện ngay trên UI mà không cần F5)
        io.to(receiverId.toString()).emit("new-conversation", formatted);

        // ========================================================================


        return res.status(200).json({
            message: "Chấp nhận lời mời kết bạn thành công!",
            newFriend: {
                _id: From_User_Info?._id,
                displayName: From_User_Info?.displayName,
                avatarURL: From_User_Info?.avatarURL
            },
            // Trả về conversation luôn nếu cần dùng ở client ngay
            conversation: formatted
        });

    } catch (error) {
        console.error("Lỗi khi nhận lời mời kết bạn", error);
        return res.status(500).json({
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};

export const declinedFriendRequest = async (req, res) => {
    try {

        const {requestId} = req.params;

        const UserId = req.user._id;

        const request = await FriendRequest.findById(requestId);

        if(!request)
        {
            return res.status(404).json({message: "Không tìm thấy lời mời kết bạn"});
        }

        if(request.To_User.toString() != UserId.toString())
        {
            return res.status(403).json({message: "Bạn không có quyền từ chối lời mời kết bạn này"})
        }

        // Từ chối lời mời nên xoá request đó khỏi collection FriendRequest // 
        await FriendRequest.findByIdAndDelete(requestId);

        return res.status(200).json({message: "Từ chối lời mời kết bạn thành công"})
        
    } catch (error) {
        console.error("Lỗi khi từ chối lời mời kết bạn", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        })
        
    }
}

export const getAllFriend = async (req, res) => {
    try {
        // Gọi tên người dùng hiện tại;
        const UserId = req.user._id;

        // Truy tìm trong collection Friend có userA == UserId hoặc UserB == UserId để lấy ra danh sách bạn bè //
        
        const Friendships = await Friend.find({
            $or: [
                    {userA: UserId},
                    {userB: UserId}

            ]
        })
        // Sử dụng populate để lấy ra các id của những người bạn //
        .populate("userA", "_id displayName avatarURL")
        .populate("userB", "_id displayName avatarURL")
        .lean();

        if(Friendships.length == 0)
        {
            return res.status(200).json({friends: []});
        }

        // Sử dụng map để duyệt và gán giá trị cho friends //
        const friends = Friendships.map((f) =>
            f.userA._id.toString() === UserId.toString() ? f.userB: f.userA
        );

        return res.status(200).json({friends});
        
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        })
        
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const UserId = req.user._id;

        const PopulateFields = '_id username displayName avatarURL';

        const [sent, recieved] = await Promise.all([
            FriendRequest.find({From_User: UserId}).populate("To_User", PopulateFields),
            FriendRequest.find({To_User: UserId}).populate("From_User", PopulateFields)
        ])

        res.status(200).json({sent, recieved});
        
    } catch (error) {
        console.error("Lỗi khi lấy danh sách lời mời kết bạn", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        })
        
    }

}