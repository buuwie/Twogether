import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import {v2 as cloudinary} from "cloudinary"
import { Server } from "socket.io"
import * as http from "http"

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import chatRoutes from "./routes/chat.route.js"
import messageRoutes from "./routes/message.route.js"

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express()

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGOSTR);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error)
    }
}

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
})

const port = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb"}));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/notification", notificationRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/message", messageRoutes)



io.on("connection", (socket) => {
    console.log("connected to socket.io")

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected")
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        // console.log("User Joined Room: " + room);
    });

    socket.on("typing", ({ room, userId }) => {
        // console.log(`User ${userId} is typing in room ${room}`);
        socket.in(room).emit("typing", userId); // Gửi kèm userId
    });

    socket.on("stop typing", ({ room, userId }) => {
        // console.log(`User ${userId} stopped typing in room ${room}`);
        socket.in(room).emit("stop typing", userId); // Gửi kèm userId
    });

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });
})

httpServer.listen(port, () => {
    console.log(`Server is loving ur mom ${port}`)
})