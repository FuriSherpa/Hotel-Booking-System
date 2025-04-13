import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import User from "../models/user";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

// Add hotel to wishlist
router.post(
  "/:hotelId",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = req.params.hotelId;

      // Check if hotel exists
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        res.status(404).json({ message: "Hotel not found" });
        return;
      }

      // Add to wishlist if not already added
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { wishlist: hotelId } }, // $addToSet prevents duplicates
        { new: true }
      );

      res.status(200).json(user?.wishlist);
    } catch (error) {
      res.status(500).json({ message: "Error updating wishlist" });
    }
  }
);

// Remove hotel from wishlist
router.delete("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { wishlist: req.params.hotelId } },
      { new: true }
    );

    res.status(200).json(user?.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist" });
  }
});

// Get user's wishlist
router.get(
  "/",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).populate<{
        wishlist: HotelType[];
      }>("wishlist");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(user.wishlist);
    } catch (error) {
      res.status(500).json({ message: "Error fetching wishlist" });
    }
  }
);

export default router;
