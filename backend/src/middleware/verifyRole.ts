import { Request, Response, NextFunction } from "express";
import User from "../models/user";

export const verifyRole = (requiredRole: "admin" | "customer") => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId; // Make sure userId is added to Request type
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (user.role !== requiredRole) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Error verifying role" });
      return;
    }
  };
};
