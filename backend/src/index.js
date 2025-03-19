import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import {connectDB} from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import chatroomRoutes from "./routes/chatroom.route.js";
import contactRoutes from "./routes/contact.route.js";

import http from "http";
import { Server } from "socket.io";

import User from "./models/user.model.js";
import Message from "./models/message.model.js";

//import {app, server} from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const userSocketMap = {};

/*
const chatHandler = async (req, res) => {
    console.log("chat handler called");
}
*/


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chatrooms", chatroomRoutes)
app.use("/api/contacts", contactRoutes);

//app.post("/api/messages", chatHandler);
const server = http.createServer(app);

if (!process.env.JEST_WORKER_ID) {
    server.listen(PORT, () => {
        console.log("server running on port " + PORT);
        connectDB();
    });
};

/*
server = app.listen(PORT, () => {
    console.log("server running on port " + PORT);
    connectDB();
})
*/

const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN,
        credentials: true
    }
});



export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`Client connected: socketId${socket.id}, user="${userId}"`);
    userSocketMap[userId] = socket.id;

    socket.on("disconnect", () => {
        console.log(`Client disconnected: socketId=${socket.id}, user="${userId}"`);
        delete userSocketMap[userId];
    });

    socket.on("sendMessage", async (req, res) => {
        try {
            const content = req.content;
            const recipientId = req.recipient;
            const senderId = req.sender;
    
            console.log(req);
            console.log(senderId);
            console.log(recipientId);

            const sender = await User.findById(senderId);
            const recipient = await User.findById(recipientId);
    
            if (!sender || !recipient) {
                console.log("invalid users")
                return //res.status(400).json({message: "Invalid user(s)"});
            };
    
            /*
            const existingChatrooms = await Chatroom.find({
                $or:[
                    {creatorId:senderId, memberId:receiverId},
                    {creatorId:receiverId, memberId:senderId}
                ]
            })
    
            if (existingChatrooms.length < 1) {
                return res.status(400).json({message: "No chatrooms exist with these users"});
            }
            */
    
            const newMessage = new Message({
                sender: senderId,
                recipient: recipientId,
                content: content
            });
    
            await newMessage.save();

            console.log("message stored");
    
            const receiverSocketId = userSocketMap[recipientId];
            const senderSocketId = userSocketMap[senderId];
            if (receiverSocketId) {
                console.log("sending to recipient")
                io.to(receiverSocketId).emit("recieveMessage", newMessage);
            }
            if (senderSocketId) {
                console.log("sending to sender")
                io.to(senderSocketId).emit("recieveMessage", newMessage);
            }
    
            //res.status(201).json(newMessage)
        } catch (error) {
            console.log("Error in sendMessage controller:", error.message);
            //res.status(500).json({error: "Internal server error"});
        }
    })
});

/*
dotenv.config();

const PORT = process.env.PORT;
*/
/*
app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true
    })
)
*/

/*

*/

/*
if (!process.env.JEST_WORKER_ID) {
    server.listen(PORT, () => {
        console.log("server running on port " + PORT);
        connectDB();
    });
};
*/

export { app, io };