import express from "express";
import { Request, Response } from "express";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { verifyRole } from "../middleware/verifyRole";

const router = express.Router();

router.get(
  "/analytics",
  verifyToken,
  verifyRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      // Get all hotels with their bookings
      const hotels = await Hotel.find({
        "bookings.checkIn": { $gte: startDate },
        "bookings.checkOut": { $lte: endDate },
      });

      // Calculate analytics
      let totalBookings = 0;
      let totalRevenue = 0;
      const bookingsPerDay = new Map();
      const hotelStats = new Map();

      hotels.forEach((hotel) => {
        hotel.bookings.forEach((booking) => {
          if (booking.checkIn >= startDate && booking.checkOut <= endDate) {
            totalBookings++;
            totalRevenue += booking.totalCost;

            // Track daily bookings
            const dateStr = booking.checkIn.toISOString().split("T")[0];
            const dayStats = bookingsPerDay.get(dateStr) || {
              count: 0,
              revenue: 0,
            };
            bookingsPerDay.set(dateStr, {
              count: dayStats.count + 1,
              revenue: dayStats.revenue + booking.totalCost,
            });

            // Track hotel performance
            const stats = hotelStats.get(hotel._id) || {
              name: hotel.name,
              totalBookings: 0,
              revenue: 0,
            };
            hotelStats.set(hotel._id, {
              name: hotel.name,
              totalBookings: stats.totalBookings + 1,
              revenue: stats.revenue + booking.totalCost,
            });
          }
        });
      });

      const response = {
        totalBookings,
        totalRevenue,
        bookingsPerDay: Array.from(bookingsPerDay.entries()).map(
          ([date, stats]) => ({
            date,
            ...stats,
          })
        ),
        topHotels: Array.from(hotelStats.entries())
          .map(([hotelId, stats]) => ({
            hotelId,
            ...stats,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  }
);

export default router;
