import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import { verifyRole } from "../middleware/verifyRole";
import Hotel from "../models/hotel";
import { BookingStatus } from "../shared/types";
import { updateBookingStatus } from "../utils/bookingUtils";

const router = express.Router();

// Get all bookings (admin only)
router.get(
  "/",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const hotels = await Hotel.find({
        bookings: { $exists: true, $ne: [] },
      });

      // Update booking statuses
      for (const hotel of hotels) {
        for (const booking of hotel.bookings) {
          await updateBookingStatus(hotel._id, booking);
        }
      }

      // Fetch updated hotels
      const updatedHotels = await Hotel.find({
        bookings: { $exists: true, $ne: [] },
      });

      res.json(updatedHotels);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  }
);

// Cancel booking (admin only)
router.put(
  "/:hotelId/bookings/:bookingId/cancel",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId, bookingId } = req.params;
      const { cancellationReason } = req.body;

      const hotel = await Hotel.findOneAndUpdate(
        {
          _id: hotelId,
          "bookings._id": bookingId,
        },
        {
          $set: {
            "bookings.$.status": BookingStatus.CANCELLED,
            "bookings.$.cancellationReason": cancellationReason,
            "bookings.$.cancelledAt": new Date(),
          },
        },
        { new: true }
      );

      if (!hotel) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error cancelling booking" });
    }
  }
);

export default router;
