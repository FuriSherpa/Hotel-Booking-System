import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import {
  BookingType,
  HotelSearchResponse,
  BookingStatus,
} from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(400).json({ message: "Hotel not found" });
      return;
    }

    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "npr",
      metadata: {
        hotelId,
        userId: req.userId,
      },
    });

    if (!paymentIntent.client_secret) {
      res.status(500).json({ message: "Error creating payment intent" });
      return;
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };

    res.send(response);
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;
      const booking = {
        ...req.body,
        userId: req.userId,
        status: BookingStatus.CONFIRMED, // Ensure status is set
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hotel = await Hotel.findOneAndUpdate(
        { _id: hotelId },
        {
          $push: { bookings: booking },
        },
        { new: true }
      );

      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      // Return the newly created booking
      const newBooking = hotel.bookings[hotel.bookings.length - 1];
      res.status(200).json({
        booking: newBooking,
        hotel: hotel,
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.post(
  "/:hotelId/bookings/:bookingId/cancel",
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

      // First check if the booking exists
      const existingHotel = await Hotel.findOne({
        _id: hotelId,
        "bookings._id": bookingId,
        "bookings.userId": req.userId,
      });

      if (!existingHotel) {
        console.log("Booking not found:", {
          hotelId,
          bookingId,
          userId: req.userId,
        });
        res.status(404).json({
          message: "Booking not found",
          details: "Could not find matching hotel and booking combination",
        });
        return;
      }

      // Update the booking status
      const updatedHotel = await Hotel.findOneAndUpdate(
        {
          _id: hotelId,
          "bookings._id": bookingId,
        },
        {
          $set: {
            "bookings.$.status": BookingStatus.REFUND_PENDING,
            "bookings.$.cancellationReason": cancellationReason,
            "bookings.$.cancelledAt": new Date(),
          },
        },
        { new: true }
      );

      if (!updatedHotel) {
        console.log("Failed to update booking:", { hotelId, bookingId });
        res.status(500).json({ message: "Failed to update booking status" });
        return;
      }

      const updatedBooking = updatedHotel.bookings.find(
        (b) => b._id.toString() === bookingId
      );

      console.log("Booking cancelled successfully:", {
        hotelId,
        bookingId,
        newStatus: updatedBooking?.status,
      });

      res.status(200).json({
        message: "Booking cancelled successfully",
        refundMessage:
          "Your refund has been initiated. Please allow 5-7 business days for the amount to be refunded.",
        booking: updatedBooking,
      });
      return;
    } catch (error) {
      console.error("Error in cancellation:", error);
      res.status(500).json({
        message: "Error cancelling booking",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export default router;
