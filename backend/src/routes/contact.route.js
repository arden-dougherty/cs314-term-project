import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import { getUserList } from "../controllers/message.controller.js";
import { getContactList, contactSearch, deleteMessages } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/all-contacts", protectRoute, getUserList);
router.get("/get-contacts-for-list", protectRoute, getUserList);
router.post("/search", protectRoute, contactSearch);
router.delete("/delete-dm/:dmId", deleteMessages);

export default router;