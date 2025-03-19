import User from "../models/user.model.js";
import Chatroom from "../models/chatroom.model.js";
import {generateToken} from "../lib/utils.js";

export const createChatroom = async (req, res) => {
    try {
        const thisUserId = req.user._id;
        const {id: otherUserId} = req.params;

        const creatorExists = await User.findById(thisUserId);
        const memberExists = await User.findById(otherUserId);

        if (!creatorExists || !memberExists) {
            return res.status(404).json({message: "Invalid user(s)"});
        }

        const existingChatrooms = await Chatroom.find({
            $or:[
                {creatorId:thisUserId, memberId:otherUserId},
                {creatorId:otherUserId, memberId:thisUserId}
            ]
        });

        if (existingChatrooms.length > 0) {
            return res.status(400).json({message: "A chatroom already exists with these users"});
        };

        const newChatroom = new Chatroom({
            creatorId: thisUserId,
            memberId: otherUserId
        });

        if (newChatroom) {
            generateToken(newChatroom._id, res);
            await newChatroom.save();
        
            res.status(201).json({
            _id:newChatroom._id,
            creatorId:newChatroom.creatorId,
            memberId:newChatroom.memberId
        })
        }
        else {
            res.status(400).json({message: "Invalid data"});
        }
    } catch (error) {
        console.log("Error in createChatroom controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const deleteChatroom = async (req, res) => {
    try {
        // delete by user id
        const thisUserId = req.user._id
        const {id: otherUserId} = req.params

        const existingChatrooms = await Chatroom.find({
            $or:[
                {creatorId:thisUserId, memberId:otherUserId},
                {creatorId:otherUserId, memberId:thisUserId}
            ]
        })

        if (existingChatrooms.length < 1) {
            return res.status(400).json({message: "No chatrooms exist with these users"});
        }

        for (let chatroom of existingChatrooms) {
            await Chatroom.findByIdAndDelete(chatroom._id);
            res.status(200).json({message: "Chatroom deleted successfully"});
        }
        // delete by chatroom id
        /*
        const {id: chatroomId} = req.params;

        const chatroomExists = await Chatroom.findById(chatroomId);

        if (!chatroomExists) {
            return res.status(404).json({message: "Chatroom not found"});
        }

        await Chatroom.findByIdAndDelete(chatroomId);
        res.status(200).json({message: "Chatroom deleted successfully"});
        */
    } catch (error) {
        console.log("Error in deleteChatroom controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const getChatroomList = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const chatrooms = await Chatroom.find({
            $or:[
                {creatorId:loggedInUserId},
                {memberId:loggedInUserId}
            ]
        })

        res.status(200).json(chatrooms);
    } catch (error) {
        console.log("Error in getChatroomList:", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};