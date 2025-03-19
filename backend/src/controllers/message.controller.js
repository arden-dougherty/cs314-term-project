import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Chatroom from "../models/chatroom.model.js";
import {getReceiverSocketId, io} from "../lib/socket.js";

export const getUserList = async (req, res) => {
    console.log("getUserList called");
    
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");
        
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getUserList:", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id:otherUserId} = req.params;
        const thisUserId = req.user._id;
        
        const messages = await Message.find({
            $or:[
                {senderId:thisUserId, receiverId:otherUserId},
                {senderId:otherUserId, receiverId:thisUserId}
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({error: 'Internal server error'});
    }
};

export const sendMessage = async (req, res) => {
    try {
        const {text} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(400).json({message: "Invalid user(s)"});
        };

        const existingChatrooms = await Chatroom.find({
            $or:[
                {creatorId:senderId, memberId:receiverId},
                {creatorId:receiverId, memberId:senderId}
            ]
        })

        if (existingChatrooms.length < 1) {
            return res.status(400).json({message: "No chatrooms exist with these users"});
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};