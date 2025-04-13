import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import multer from "multer";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 8 or more characters required").isLength({
      min: 8,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
      return;
    }
    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (user) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      user = new User(req.body);
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      res.status(200).send({ message: "User registered OK" });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

router.put(
  "/profile",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, phoneNumber } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.firstName = firstName;
      user.lastName = lastName;
      user.phoneNumber = phoneNumber;

      await user.save();

      const userWithoutPassword = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role,
      };

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  }
);

router.put(
  "/password",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      user.password = newPassword; // Will be hashed by the pre-save middleware
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password" });
    }
  }
);

export default router;
