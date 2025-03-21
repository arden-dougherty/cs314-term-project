import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        recipient: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
            requried: true
        },
        content: {
            type: String
        },
        timestamp: {
            type: Date
        }
    },
    {timestamps: true}
);

const Message = mongoose.model("Message", messageSchema);

export default Message;