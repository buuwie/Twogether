import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { allMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", protectRoute, sendMessage)
router.get("/:chatId", protectRoute, allMessages)

export default router;