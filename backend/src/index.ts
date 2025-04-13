import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";
import adminRoutes from "./routes/admin";
import reviewRoutes from "./routes/reviews";
import wishlistRoutes from "./routes/wishlist";
import adminBookingsRoutes from "./routes/admin-bookings";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_COLLECTION_STRING as string);

const app = express(); // creating express app
app.use(cookieParser());
app.use(express.json()); // converts the body of api into json automatically
app.use(express.urlencoded({ extended: true })); // parse the url to get parameters
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
); // for security

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin/bookings", adminBookingsRoutes);

app.listen(7000, () => {
  console.log("Server running on localhost 7000");
});
