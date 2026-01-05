import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        trim: true
    },

    imgUrl: {
        type: String
    }
  },
  {
    timestamps: true
  }
)

MessageSchema.index({conversationId: 1, createdAt: -1});

const Message = mongoose.model("Message", MessageSchema);

export default Message;


