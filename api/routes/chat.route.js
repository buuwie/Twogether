import express from "express"
import { accessChat, 
    addToGroup, 
    createGroupChat, 
    getChats, 
    removeFromGroup, 
    renameGroup
} from "../controllers/chat.controller.js"
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, accessChat)
router.get("/", protectRoute, getChats)
router.post("/group", protectRoute, createGroupChat)
router.put("/rename", protectRoute, renameGroup)
router.put("/groupRemove", protectRoute, removeFromGroup)
router.put("/groupAdd", protectRoute, addToGroup)

export default router;