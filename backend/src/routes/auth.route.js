import express from "express";
import {signup, login, logout, updateName, checkAuth} from "../controllers/auth.controller.js";
import {protectRoute} from  "../middleware/auth.middleware.js";
//import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/update-profile", protectRoute, updateName);

router.get("/userinfo", protectRoute, checkAuth);

export default router;