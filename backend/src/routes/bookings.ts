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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId, bookingId } = req.params;
      const { cancellationReason } = req.body;

      const hotel = await Hotel.findOne({
        _id: hotelId,
        "bookings._id": bookingId,
        "bookings.userId": req.userId,
      });

      if (!hotel) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      const booking = hotel.bookings.find(
        (b) => b._id.toString() === bookingId
      );

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // Validate booking can be cancelled
      const validationError = validateCancellationEligibility(booking);
      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      // Process refund through Stripe
      try {
        // Set status to pending before attempting refund
        await Hotel.findOneAndUpdate(
          {
            _id: hotelId,
            "bookings._id": bookingId,
          },
          {
            $set: {
              "bookings.$.status": BookingStatus.REFUND_PENDING,
              "bookings.$.cancellationReason": cancellationReason,
            },
          }
        );

        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });

        // Update to refunded status after successful refund
        const updatedHotel = await Hotel.findOneAndUpdate(
          {
            _id: hotelId,
            "bookings._id": bookingId,
          },
          {
            $set: {
              "bookings.$.status": BookingStatus.REFUNDED,
              "bookings.$.cancellationReason": cancellationReason,
              "bookings.$.refundId": refund.id,
              "bookings.$.cancelledAt": new Date(),
            },
          },
          { new: true }
        );

        res.status(200).json({
          message: "Booking cancelled and refunded successfully",
          booking: updatedHotel?.bookings.find(
            (b) => b._id.toString() === bookingId
          ),
        });
      } catch (stripeError) {
        await Hotel.findOneAndUpdate(
          {
            _id: hotelId,
            "bookings._id": bookingId,
          },
          {
            $set: {
              "bookings.$.status": BookingStatus.REFUND_FAILED,
              "bookings.$.cancellationReason": cancellationReason,
              "bookings.$.cancelledAt": new Date(),
            },
          }
        );

        throw stripeError;
      }
    } catch (error) {
      console.error("Refund error:", error);
      res.status(500).json({ message: "Error processing refund" });
    }
  }
);

export default router;
