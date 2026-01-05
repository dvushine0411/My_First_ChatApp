import mongoose from "mongoose";


const FriendRequestSchema = new mongoose.Schema({
    From_User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    To_User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        MaxLength: 300
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// Đảm bảo chỉ có 1 yêu cầu kết bạn duy nhất giữa From_User và To_User //
FriendRequestSchema.index({From_User: 1, To_User: 1}, {unique: true});

// Dùng để tìm trong danh sách các lời mời đã gửi đi // 
FriendRequestSchema.index({From_User: 1});

// Dùng để tìm trong danh sách những lời mời đã được nhận //
FriendRequestSchema.index({To_User: 1});

const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema);

export default FriendRequest;



