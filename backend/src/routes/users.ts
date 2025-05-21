import express, { Request, Response } from "express";
import User from "../models/user";
import { UserType } from "../shared/types";
import { Document } from "mongoose";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import multer from "multer";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import { generateOTP, getOTPExpiryTime } from "../utils/otpUtils";
import {
  sendVerificationEmail,
  verifyEmailExists,
} from "../utils/emailService";
import transporter from "../config/email";

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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ message: errors.array() });
        return;
      }

      const { email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      // Verify email exists
      const isValidEmail = await verifyEmailExists(email);
      if (!isValidEmail) {
        res.status(400).json({
          message:
            "Invalid email address. Please ensure you've entered a valid email and try again.",
          details: "Email validation failed",
        });
        return;
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiryTime();

      try {
        // Send verification email first
        await sendVerificationEmail(email, otp);

        // Create user only after email is sent successfully
        const user = new User({
          ...req.body,
          emailVerificationOTP: otp,
          emailVerificationOTPExpires: otpExpiry,
          isEmailVerified: false,
        });

        await user.save();

        res.status(200).json({
          message: "Registration initiated. Please verify your email.",
          userId: user._id,
        });
        return;
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        res.status(400).json({
          message:
            "Could not send verification email. Please check your email address.",
        });
        return;
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Something went wrong" });
      return;
    }
  }
);

// Add new verify email endpoint
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: "Email already verified" });
      return;
    }

    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
      res.status(400).json({ message: "Invalid verification code" });
      return;
    }

    if (
      !user.emailVerificationOTPExpires ||
      new Date() > user.emailVerificationOTPExpires
    ) {
      res.status(400).json({ message: "Verification code has expired" });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    res.status(200).json({ message: "Email verified successfully" });
    return;
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
});

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

// Add this interface above the route
interface SMTPError extends Error {
  code?: string;
  command?: string;
}

// Then update the route
router.get("/test-smtp", async (req: Request, res: Response) => {
  try {
    const verify = await transporter.verify();
    res.json({
      smtpWorking: verify,
      emailConfig: {
        host: process.env.EMAIL_USER ? "Configured" : "Missing",
        pass: process.env.EMAIL_PASSWORD ? "Configured" : "Missing",
      },
    });
  } catch (error) {
    const smtpError = error as SMTPError;
    res.status(500).json({
      error: "SMTP verification failed",
      details: smtpError.message,
      code: smtpError.code,
      command: smtpError.command,
    });
  }
});

// Add this new test route
router.get("/test-email-config", async (req: Request, res: Response) => {
  try {
    const config = {
      emailUser: process.env.EMAIL_USER ? "Set" : "Missing",
      emailPass: process.env.EMAIL_PASSWORD ? "Set" : "Missing",
      emailUserValue: process.env.EMAIL_USER?.substring(0, 3) + "...", // Show first 3 chars only
    };

    const smtpTest = await transporter.verify();

    res.json({
      config,
      smtpTest,
      message: smtpTest
        ? "SMTP configuration is valid"
        : "SMTP configuration failed",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "SMTP test failed",
      message: error.message,
      code: error.code,
    });
  }
});

export default router;
