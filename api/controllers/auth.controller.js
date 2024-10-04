import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
    try {
		const { fullName, username, email, password } = req.body;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return next(errorHandler(400, 'Vui lòng nhập đúng định dạng Email'));
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return next(errorHandler(400, 'Tên người dùng này đã được sử dụng'));
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return next(errorHandler(400, 'Email này đã được sử dụng'));
		}

		if (password.length < 6) {
			return next(errorHandler(400, 'Mật khẩu phải có ít nhất 6 kí tự'));
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			next(errorHandler(400, 'Invalid user data'));
		}
	} catch (error) {
		console.log("Error in signup controller:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const login = async (req, res, next) => {
    try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return next(errorHandler(400, 'Tên người dùng hoặc mật khẩu không đúng'));
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
    try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Đăng xuất thành công" });
	} catch (error) {
		console.log("Error in logout controller:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};