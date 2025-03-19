import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import { getContactList, contactSearch, deleteMessages } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/all-contacts", protectRoute, getContactList);
router.get("/get-contacts-for-list", protectRoute, getContactList);
router.post("/search", protectRoute, contactSearch);
router.delete("/delete-dm/:dmId", protectRoute, deleteMessages);

export default router;