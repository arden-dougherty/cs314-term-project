import mongoose from "mongoose";

const chatroomSchema = new mongoose.Schema(
    {
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {timestamps: true}
);

const Chatroom = mongoose.model("Chatroom", chatroomSchema);

export default Chatroom;