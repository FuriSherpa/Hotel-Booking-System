import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import User from "../models/user";
import mongoose from "mongoose";
import { BookingStatus } from "../shared/types";

const router = express.Router();

// Define interface for request body
interface ReviewRequestBody {
  rating: number;
  comment: string;
  bookingId: string;
}

// Add a review
router.post(
  "/:hotelId",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hotelId = req.params.hotelId;
      const { rating, comment, bookingId } = req.body;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      // Check if booking exists and is completed
      const booking = hotel.bookings.find(
        (b) =>
          b._id.toString() === bookingId &&
          b.userId === req.userId &&
          b.status === "COMPLETED" &&
          new Date(b.checkOut) < new Date()
      );

      if (!booking) {
        res.status(403).json({
          message: "Booking not found or not eligible for review",
        });
        return;
      }

      // Check if review already exists for this booking
      const existingReview = hotel.reviews.find(
        (r) => r.bookingId === bookingId
      );
      if (existingReview) {
        res.status(400).json({
          message: "You have already submitted a review for this booking",
        });
        return;
      }

      const user = await User.findById(req.userId);
      const review = {
        _id: new mongoose.Types.ObjectId().toString(), // Add this line
        bookingId,
        userId: req.userId,
        rating,
        comment,
        userName: `${user?.firstName} ${user?.lastName}`,
        createdAt: new Date(),
      };

      hotel.reviews.push(review);
      await hotel.save();

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
