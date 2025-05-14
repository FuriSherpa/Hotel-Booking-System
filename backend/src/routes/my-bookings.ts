import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";
import { updateBookingStatus } from "../utils/bookingUtils";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    // Update booking statuses
    for (const hotel of hotels) {
      for (const booking of hotel.bookings) {
        if (booking.userId === req.userId) {
          await updateBookingStatus(hotel._id, booking);
        }
      }
    }

    // Fetch updated hotels
    const updatedHotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = updatedHotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );

      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
