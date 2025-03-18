import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
//import authMiddleware from "../middleware/auth.middleware.js";
import {createChatroom, deleteChatroom} from "../controllers/chatroom.controller.js"

const router = express.Router();

router.post("/create/:id", protectRoute, createChatroom);
router.delete("/delete/:id", protectRoute, deleteChatroom);

export default router;