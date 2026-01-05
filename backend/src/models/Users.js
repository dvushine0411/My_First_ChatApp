import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        hashedPassword: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            trim: true
        },
        displayName: {
            type: String,
            required: true,
            trim: true
        },
        avatarURL: {
            type: String
        },
        avatarID: {
            type: String
        },
        bio: {
            type: String,
            maxlength: 500
        },
        phone: {
            type: String,
            sparse: true
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);
export default User;
