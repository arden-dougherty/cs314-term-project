import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUserList, getMessages, sendMessage} from "../controllers/message.controller.js";
//import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUserList)

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;