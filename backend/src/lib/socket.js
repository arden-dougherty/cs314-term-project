/*
import {Server} from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import {connectDB} from "../lib/db.js";
import authRoutes from "../routes/auth.route.js";
import messageRoutes from "../routes/message.route.js";
import chatroomRoutes from "../routes/chatroom.route.js";
import contactRoutes from "../routes/contact.route.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chatrooms", chatroomRoutes)
app.use("/api/contacts", contactRoutes);
const server = http.createServer(app);

if (!process.env.JEST_WORKER_ID) {
    server.listen(PORT, () => {
        console.log("server running on port " + PORT);
        connectDB();
    });
};

const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN
    }
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
};

io.on("connection", (socket) => {
    const user = socket.handshake.query.user;
    console.log(`Client connected: socketId'${socket.id}, user="${user}"`);
    userSocketMap[user] = socket.id;

    socket.on("disconnect", () => {
        console.log(`Client disconnected: socketId=${socket.id}, user="${user}"`);
        delete userSocketMap[user];
    });
});

export {io, app, server};
*/