import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { BookingStatus } from "../shared/types";
import Stripe from "stripe";
import { validateCancellationEligibility } from "../utils/bookingUtils";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

router.post(
  "/hotels/:hotelId/bookings/:bookingId/cancel",
  verifyToken,
  async (req: Request, res: Response) => {
    console.log("Cancellation request received:", {
      hotelId: req.params.hotelId,
      bookingId: req.params.bookingId,
      userId: req.userId,
    });

    try {
      const { hotelId, bookingId } = req.params;
      const { cancellationReason } = req.body;

      const hotel = await Hotel.findOne({
        _id: hotelId,
        "bookings._id": bookingId,
        "bookings.userId": req.userId,
      });

      if (!hotel) {
        console.log("Hotel or booking not found");
        res.status(404).json({
          message: "Booking not found",
          details: "Could not find matching hotel and booking combination",
        });
        return;
      }

      const updatedHotel = await Hotel.findOneAndUpdate(
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

      if (!updatedHotel) {
        res.status(404).json({ message: "Could not update booking" });
        return;
      }

      res.status(200).json({
        message: "Booking cancelled successfully",
        booking: updatedHotel.bookings.find(
          (b) => b._id.toString() === bookingId
        ),
      });
      return;
    } catch (error) {
      console.error("Cancellation error:", error);
      res.status(500).json({
        message: "Error cancelling booking",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  }
);

export default router;
