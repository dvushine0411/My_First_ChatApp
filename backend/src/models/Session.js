import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },  
        expiresAt: {
            type: Date,
            required: true
        },
    },
    {
        timestamps: true
    }
);

SessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

export default mongoose.model("Session", SessionSchema);
