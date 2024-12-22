import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { 
    getUserProfile, 
    getSuggestedUsers, 
    followUnfollowUser,
    updateUser, 
    getSuggestedUsersFromFollowersOrFollowings, 
    findUsers 
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);
router.get("/find", protectRoute, findUsers);
router.get("/suggestedFromFollowersOrFollowing", protectRoute, getSuggestedUsersFromFollowersOrFollowings);

export default router;