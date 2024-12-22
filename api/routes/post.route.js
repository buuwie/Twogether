import express from "express";
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts,
    getLikedPosts, getFollowingPosts, getUserPosts,
    getUserPostsNum,
    getPostsByHashtag,
    getTopic
 } from "../controllers/post.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);
router.get("/user/posts/:username", protectRoute, getUserPostsNum);
router.get("/topic/:id", protectRoute, getPostsByHashtag)
router.get("/hashtag/:id", protectRoute, getTopic)

export default router;