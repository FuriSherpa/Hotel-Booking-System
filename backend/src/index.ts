import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose'
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_COLLECTION_STRING as string)

const app = express(); // creating express app
app.use(cookieParser());
app.use(express.json()) // converts the body of api into json automatically
app.use(express.urlencoded({extended: true})) // parse the url to get parameters
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
})); // for security

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(7000, ()=> {
    console.log("Server running on localhost 7000");
});