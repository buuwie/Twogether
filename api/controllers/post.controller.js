import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Topic from "../models/topic.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		// Trích xuất các hashtag từ text nếu có
		const hashtags = text ? text.match(/#[a-zA-Z0-9_]+/g) : [];

		// Mảng để chứa các ObjectId của topic
		let topicIds = [];
	
		if (hashtags && hashtags.length > 0) {
		  for (let hashtag of hashtags) {
			const topicName = hashtag.slice(1); // Bỏ dấu # để lấy tên topic
	
			// Tìm topic theo tên, nếu không có thì tạo mới
			let topic = await Topic.findOne({ name: topicName });
			if (!topic) {
			  topic = new Topic({ name: topicName });
			  await topic.save();
			}
			
			// Thêm ObjectId của topic vào mảng topicIds
			topicIds.push(topic._id);
		  }
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
			topics: topicIds,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			await Notification.findOneAndDelete({from: userId, to: post.user, postId: postId});

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
				postId: postId,
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			})
			.populate({
				path: "topics",  // Populate để lấy thông tin topics
				select: "name",  // Chỉ lấy tên của topic
			});
		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			})
			.populate({
				path: "topics",  // Populate để lấy thông tin topics
				select: "name",  // Chỉ lấy tên của topic
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			})
			.populate({
				path: "topics",  // Populate để lấy thông tin topics
				select: "name",  // Chỉ lấy tên của topic
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			})
			.populate({
				path: "topics",  // Populate để lấy thông tin topics
				select: "name",  // Chỉ lấy tên của topic
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPostsNum = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

			const totalPosts = posts.length;

		res.status(200).json(totalPosts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getPostsByHashtag = async (req, res) => {
	try {
	  const { id: topicId } = req.params; // Lấy "id" từ URL và đặt nó vào biến topicId
	//   console.log("topicId: ", topicId);  // Log để kiểm tra giá trị topicId
  
	  if (!topicId) {
		return res.status(400).json({ error: "Topic ID is required" });
	  }
  
	  // Kiểm tra xem topic có tồn tại hay không
	  const topic = await Topic.findById(topicId);
	  if (!topic) {
		return res.status(404).json({ message: "Topic not found" });
	  }
  
	  const posts = await Post.find({ topics: topicId })
		.sort({ createdAt: -1 })
		.populate("user", "-password")
		.populate("comments.user", "-password")
		.populate("topics", "name");
  
	  if (posts.length === 0) {
		return res.status(200).json({ message: "No posts for this topic" });
	  }
  
	  res.status(200).json(posts);
	} catch (error) {
	  console.error("Error in getPostsByHashtag:", error);
	  res.status(500).json({ error: "Internal server error" });
	}
  };

  export const getTopic = async (req, res) => {
	try {
		const { id: topicId } = req.params;
		// console.log("topicId: ", topicId);

		const topic = await Topic.findById( topicId );
		if (!topic) return res.status(404).json({ message: "Topic not found" });

		res.status(200).json(topic);
	} catch (error) {
		console.log("Error in getTopic: ", error.message);
		res.status(500).json({ error: error.message });
	}
};