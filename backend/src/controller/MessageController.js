import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterMessage } from "../utils/MessageHelper.js";
import { emitNewMessage } from "../socket/socketHandlers.js";
import {io} from '../socket/socket.js'
import cloudinary from '../libs/cloudinary.js'
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";

export const SendDirectMessage = async (req, res) => {
    try {
        const {recipientId, conversationId, content, imgUrl} = req.body;

        const senderId = req.user._id;
        const imageFile = req.file;

        // Khai báo biến conversation dùng để lưu trạng thái của cuộc trò chuyện //
        let conversation; 

        if(!content && !imageFile)
        {
            return res.status(400).json({message: "Thiếu nội dung"});
        }

        let uploadedImgUrl = null;
        
        if(imageFile)
        {
            const uploadRes = await uploadImageFromBuffer(imageFile.buffer);
            uploadedImgUrl = uploadRes.secure_url;
        }

        if(conversationId)
        {
            conversation = await Conversation.findById(conversationId);
        }

        if(!conversation && recipientId)
        {
            conversation = await Conversation.findOne({
                type: 'direct',
                $and: [
                    {"participants.userId": senderId},
                    {"participants.userId": recipientId}
                ]
            })
        }

        if(!conversation)
        {
            if(!recipientId)
            {
                res.status(400).json({message: "Không xác định được người dùng"});
            }

            conversation = await Conversation.create({
                type: 'direct',
                participants: [
                    {userId: senderId, joinedAt: new Date()},
                    {userId: recipientId, joinedAt: new Date()}
                ],
                lastMessageAt: new Date(),
                seenBy: [senderId],
                unreadCounts: {
                    [senderId]: 0,
                    [recipientId]: 0
                }
            })
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: senderId,
            content: content,
            imgUrl: uploadedImgUrl || null
        })

        // Sử dụng 1 hàm để tái sử dụng //
        // Hàm này dùng để update trạng thái của conversations //

        updateConversationAfterMessage(conversation, message, senderId);

        await conversation.save();

        // Lưu xong vào database rồi mới bắn lên trên giao diện để tránh tin nhắn ma (Ghost Message) //

        emitNewMessage(io, conversation, message);

        return res.status(201).json({message});
        
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn trực tiếp", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
        
    }

}
export const SendGroupMessage = async (req, res) => {
    try {
        const {conversationId, content, imgUrl} = req.body;
        const senderId = req.user._id;
        const imageFile = req.file;

        const conversation = req.conversation;

        if(!content && !imageFile)
        {
            console.log("Lỗi không có nội dung");
            return res.status(400).json({message: "Thiếu nội dung"});
        }

        let uploadedImgUrl = null;

        if(imageFile)
        {
            const uploadRes = await uploadImageFromBuffer(imageFile.buffer);
            uploadedImgUrl = uploadRes.secure_url;
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: senderId,
            content: content,
            imgUrl: uploadedImgUrl || null
        });

        console.log("Tạo xong message, Tiếp đến hàm update");

        updateConversationAfterMessage(conversation, message, senderId);

        console.log("Update xong, h chuyển đến lưu lại")

        await conversation.save();

        emitNewMessage(io, conversation, message);

        console.log("Lưu xong");

        return res.status(201).json({message});


    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn nhóm", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
        
    }

}