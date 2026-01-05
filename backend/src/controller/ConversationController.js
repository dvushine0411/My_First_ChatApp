import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {io} from "../socket/socket.js";



export const createConversation = async (req, res) => {
    try {
        const {type, name, memberIds} = req.body;

        const userId = req.user._id;

        if(!type || !memberIds || memberIds.length == 0)
        {
            return res.status(400).json({message: "Dữ liệu thiếu type hoặc memberIds"});
        }

        let conversation;

        // Tìm xem đã tồn tại cuộc trò chuyện hay chưa //
        if(type == 'direct')    
        {
            const participantId = memberIds[0];
            conversation = await Conversation.findOne({
                type: 'direct',
                // Kiểm tra xem có cuộc trò chuyện nào trong participants có userId và participantId hay chưa // 
                "participants.userId": {$all: [userId, participantId]}  
            });

            if(!conversation)
            {
                conversation = await Conversation.create({
                    type: 'direct',
                    participants: [
                        {userId}, 
                        {userId: participantId}
                    ],
                    lastMessageAt: new Date(),
                    unreadCounts: new Map()
                });

                await conversation.save();
            }
        }


        if(type == 'group')
        {
            if(!name)
            {
                return res.status(400).json({message: "Tên nhóm là bắt buộc"});
            }
            const existingGroup = await Conversation.findOne({
                type: 'group',
                "group.name": req.body.name,
                "participants.userId": userId
            }); 

            if(existingGroup)
            {
                return res.status(400).json({message: "Tên nhóm đã tồn tại"})   
            }
            else
            {
                conversation = new Conversation({
                    type: 'group',
                    participants: [
                        {userId},
                        ...memberIds.map((id) => ({userId: id}))
                    ],
                    group: {
                        name,
                        createdBy: userId
                    },
                    lastMessageAt: new Date(),
                    unreadCounts: new Map()
                })
            }
            await conversation.save();
        }

        if(conversation)
        {
            await conversation.populate([
            {path: "participants.userId", select: "displayName avatarURL"},
            {path: "seenBy", select: "displayName avatarURL"},
            {path: "lastMessage.senderId", select: "displayName avatarURL"}
          ]);
        }

        const participants = (conversation.participants || []).map((p) => ({
            _id: p.userId?._id,
            displayName: p.userId?.displayName,
            avatarURL: p.userId?.avatarURL,
            joinedAt: p.userId?.joinedAt
        }))

        const formatted = { ...conversation.toObject(), participants};

        if(type == 'group')
        {
            memberIds.forEach((userId) => {
                io.to(userId).emit("new-group", formatted);
            })
        }

        return res.status(201).json({conversation: formatted});


    } catch (error) {
        console.error("Không tạo được conversation", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
        
    }

}

export const getConversation = async (req, res) => {
    try {

        const userId = req.user._id;
        const conversations = await Conversation.find({
            "participants.userId": userId                // Tìm các cuộc hội thoại mà userId này có tham gia // 
        })
            .sort({lastMessageAt: -1, updatedAt: -1})
            .populate(
                {path: "participants.userId", select: "displayName avatarURL"}
            )
            .populate(
                {path: "lastMessage.senderId", select: "displayName avatarURL"}
            )
            .populate(
                {path: "seenBy", select: "displayName avatarURL"}
            );

        const formatted = conversations.map((conver) => {
            const participants = (conver.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayName: p.userId?.displayName,
                avatarURL: p.userId?.avatarURL ?? null,
                joinedAt: p.userId?.joinedAt
            }));

        const seenBy = (conver.seenBy || []).map((p) => ({
            _id: p._id,
            displayName: p.displayName,
            avatarURL: p.avatarURL ?? null
        }));

        return {
            ...conver.toObject(),
            unreadCounts: conver.unreadCounts || {},
            participants,
            seenBy
        }
    })

        return res.status(200).json({conversations: formatted});

        
    } catch (error) {
        console.error("Lỗi xảy ra khi lấy conversation", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
        
    }

}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;

    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy messages", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
export const getUserConversationsforSocketIO = async (userId) => {
    try {

        const conversations = await Conversation.find(
            {"participants.userId": userId},
            {_id: 1}
        )
        return conversations.map((c) => c._id.toString());
        
    } catch (error) {
        console.error("Đã xảy ra lỗi khi fetch conversations", error);
        return [];
    }

}

export const markAsSeen = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const userId = req.user._id.toString();

        const conversation = await Conversation.findById(conversationId).lean();

        if(!conversation)
        {
            return res.status(404).json({message: "Cuộc trò chuyện không tồn tại"});
        }

        const last = conversation.lastMessage;

        if(!last)
        {
            return res.status(200).json({message: "Không có tin nhắn nào để mark seen"});
        }

        if(last.senderId.toString() == userId)
        {
            return res.status(200).json({message: "Sender không cần phải mark as seen"});
        }

        const updated = await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: {seenBy: userId},
            $set: {[`unreadCounts.${userId}`]: 0},
        }, {
            new : true
        });

        io.to(conversationId).emit("read-message", {
            conversation: updated,
            lastMessage: {
                _id: updated?.lastMessage._id,
                content: updated?.lastMessage.content,
                createdAt: updated?.lastMessage.createAt,
                sender: {
                    _id: updated?.lastMessage.senderId
                }
            },
        })

        return res.status(200).json({
            message: "Marked as seen",
            seenBy: updated?.seenBy || [],
            myUnreadCounts: updated?.unreadCounts[userId] || 0,
        })
        
    } catch (error) {
        console.error("Lỗi khi mark as seen", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
        
    }
}



