import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary"

export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const findUsers = async (req, res) => {
	const escapeRegex = (string) => {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape các ký tự đặc biệt
	  };
	
	const searchQuery = req.query.search ? escapeRegex(req.query.search) : '';

	const keyword = searchQuery
    ? {
        $or: [
          { fullName: { $regex: searchQuery, $options: "i" } },
          { username: { $regex: searchQuery, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
}

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "Bạn không thể theo dõi/hủy theo dõi chính mình" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            await Notification.findOneAndDelete({ from: req.user._id , to: userToModify._id , type: "follow" })

			res.status(200).json({ message: "Hủy theo dõi người dùng thành công" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "Theo dõi người dùng thành công" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsersFromFollowersOrFollowings = async (req, res) => {
	try {
	  const userId = req.user._id;
  
	  // Lấy danh sách followers và followings của người dùng hiện tại
	  const user = await User.findById(userId).select("followers following");
  
	  // Danh sách những người theo dõi bạn (followers) và bạn đang theo dõi (followings)
	  const followersAndFollowings = [...user.followers, ...user.following];
  
	  if (followersAndFollowings.length === 0) {
		return res.status(200).json([]); // Trả về rỗng nếu không có follower hoặc following
	  }
  
	  // Lấy danh sách những người mà followers hoặc followings của bạn đang theo dõi hoặc được theo dõi
	  const suggestedUsers = await User.aggregate([
		{
		  $match: {
			_id: { $in: followersAndFollowings }, // Tìm tất cả những followers và followings của bạn
		  },
		},
		{
		  $lookup: {
			from: "users", // Truy vấn bảng 'users'
			localField: "following", // Danh sách những người họ theo dõi
			foreignField: "_id", // Khớp với _id của người dùng trong bảng 'users'
			as: "suggestedFollowingUsers", // Lưu vào trường tạm 'suggestedFollowingUsers'
		  },
		},
		{
		  $lookup: {
			from: "users", // Truy vấn bảng 'users'
			localField: "followers", // Danh sách những người đang theo dõi họ
			foreignField: "_id", // Khớp với _id của người dùng trong bảng 'users'
			as: "suggestedFollowerUsers", // Lưu vào trường tạm 'suggestedFollowerUsers'
		  },
		},
		{
		  $project: {
			suggestedUsers: {
			  $setUnion: ["$suggestedFollowingUsers", "$suggestedFollowerUsers"], // Gộp những người theo dõi và được theo dõi
			},
		  },
		},
		{ $unwind: "$suggestedUsers" }, // Chuyển danh sách suggestedUsers thành các đối tượng riêng lẻ
		{
		  $match: {
			"suggestedUsers._id": { $ne: userId }, // Loại bỏ chính bản thân người dùng
		  },
		},
		{
		  $sample: { size: 10 }, // Lấy ngẫu nhiên 10 người dùng để gợi ý
		},
	  ]);
  
	  // Loại bỏ những người mà user đã theo dõi hoặc chính user
	  const finalSuggestions = suggestedUsers
		.map((result) => result.suggestedUsers)
		.filter(
		  (suggestedUser) =>
			!user.following.includes(suggestedUser._id) && // Loại bỏ người dùng đã theo dõi
			!user.followers.includes(suggestedUser._id) // Loại bỏ người dùng đã theo dõi bạn
		);
  
	  // Loại bỏ trường password để bảo mật
	  finalSuggestions.forEach((suggestedUser) => {
		suggestedUser.password = null;
	  });
  
	  res.status(200).json(finalSuggestions.slice(0, 4)); // Trả về tối đa 4 gợi ý
	} catch (error) {
	  console.log("Error in getSuggestedUsersFromFollowersOrFollowings: ", error);
	  res.status(500).json({ error: "Internal server error" });
	}
  };

export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};