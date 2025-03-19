import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUserList, getMessages, sendMessage, getMessagesWithUser, chatHandler} from "../controllers/message.controller.js";
//import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUserList)

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.post("/get-messages", protectRoute, getMessagesWithUser);
router.post("/sendMessage", protectRoute, chatHandler);

export default router;