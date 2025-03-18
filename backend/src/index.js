import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import {connectDB} from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import chatroomRoutes from "./routes/chatroom.route.js"

import {app, server} from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;

app.use(
    cors({
        origin: "https://dreamqin68.github.io",
        credentials: true
    })
)

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chatrooms", chatroomRoutes)

server.listen(PORT, () => {
    console.log("server running on port " + PORT);
    connectDB();
})