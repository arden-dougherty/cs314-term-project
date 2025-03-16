import express from "express";
import {signup, login, logout, updateName, checkAuth} from "../controllers/auth.controller.js";
import {protectRoute} from  "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-name", protectRoute, updateName)

router.get("/check", protectRoute, checkAuth)

export default router;