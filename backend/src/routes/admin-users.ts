import express, { Request, Response } from "express";
import User from "../models/user";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { verifyRole } from "../middleware/verifyRole";

const router = express.Router();

// Get all users (admin only)
router.get(
  "/",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const users = await User.find({ role: "customer" }).select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/:userId",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const userToDelete = await User.findById(req.params.userId);

      if (!userToDelete) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (userToDelete.role === "admin") {
        res.status(403).json({ message: "Cannot delete admin users" });
        return;
      }

      await userToDelete.deleteOne();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  }
);

// Get user by ID
router.get(
  "/:userId",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.userId).select("-password");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user details" });
    }
  }
);

// Get user bookings
router.get(
  "/:userId/bookings",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const hotels = await Hotel.find({
        "bookings.userId": req.params.userId,
      });

      const bookings = hotels.flatMap((hotel) =>
        hotel.bookings
          .filter((booking) => booking.userId === req.params.userId)
          .map((booking) => ({
            _id: booking._id,
            userId: booking.userId,
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            adultCount: booking.adultCount,
            childCount: booking.childCount,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalCost: booking.totalCost,
            status: booking.status,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            cancellationReason: booking.cancellationReason,
            reviewed: booking.reviewed,
            hotelName: hotel.name,
            hotelCity: hotel.city,
          }))
      );

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Error fetching user bookings" });
    }
  }
);

export default router;
