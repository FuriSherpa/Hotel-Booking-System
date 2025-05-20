import express, { Request, Response } from "express";
import User from "../models/user";
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

export default router;
