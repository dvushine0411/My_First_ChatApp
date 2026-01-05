import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";
import Message from "../models/Message.js";


const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const CheckFriendship = async (req, res, next) => {
    try {

        // Chỉ khi kết bạn mới nhắn được trong direct chat //
        const me = req.user._id.toString();

        const {type, memberIds, recipientId} = req.body;

        if(type == 'group')
        {
            return next();
        }

        let targetId;

        if(memberIds && memberIds.length > 0)
        {
            targetId = memberIds[0];
        }
        else if(recipientId)
        {
            targetId = recipientId;
        }

        if(!targetId)
        {
            return res.status(400).json({message: "Thiếu thông tin người nhận"});
        }

        const [userA, userB] = pair(me, targetId);

        const CheckFriend = await Friend.findOne({userA, userB});

        if(!CheckFriend)
        {
            return res.status(400).json({message: "Hai bạn chưa kết bạn"});
        }

        return next();

        // Group chat không cần kết bạn vẫn sẽ add được vào //
        
    } catch (error) {
        console.error("Lỗi xảy ra khi Check Friendship", error);
        return res.status(500).json({Message: "Lỗi hệ thống"});   
    }

}

export const CheckGroupMembership = async (req, res, next) => {
    try {
        const {conversationId} = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if(!conversation)
        {
            console.log("Lỗi không tìm thấy conversation");
            return res.status(404).json({message: "Không tìm thấy cuộc trò chuyện"});
        }

        const isMember = conversation.participants.some((p) => p.userId.toString() === userId.toString());

        if(!isMember)
        {
            console.log("Lỗi không phải là thành viên")
            return res.status(403).json({message: "Bạn không là thành viện trong group này"});
        }

        req.conversation = conversation;

        console.log("Middeleware Ok rồi, Gọi hàm next");
        next();
        
    } catch (error) {
        console.error("Lỗi xảy ra khi CheckMembership", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
        
    }

} 