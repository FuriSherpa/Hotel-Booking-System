import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import User from "../models/user";
import mongoose from "mongoose";

const router = express.Router();

// Define interface for request body
interface ReviewRequestBody {
  rating: number;
  comment: string;
}

// Add a review
router.post(
  "/:hotelId",
  verifyToken,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1-5"),
    body("comment").isString().notEmpty().withMessage("Comment is required"),
  ],
  async (
    req: Request<{ hotelId: string }, {}, ReviewRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Get user info for the review
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const { rating, comment } = req.body;
      const hotelId = req.params.hotelId;

      // Check if user has already reviewed
      const existingReview = await Hotel.findOne({
        _id: hotelId,
        "reviews.userId": req.userId,
      });

      if (existingReview) {
        res
          .status(400)
          .json({ message: "You have already reviewed this hotel" });
        return;
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      const review = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: req.userId,
        rating,
        comment,
        userName: `${user.firstName} ${user.lastName}`,
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
