import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUserList} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUserList)

export default router;