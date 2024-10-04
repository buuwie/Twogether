import express from "express"
import authRoutes from "./routes/auth.route.js"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

dotenv.config();

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

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes)

app.listen(port, () => {
    console.log(`Server is loving ur mom ${port}`)
})