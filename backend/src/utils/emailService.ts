import dns from "dns";
import { promisify } from "util";
import transporter from "../config/email";

const resolveMx = promisify(dns.resolveMx);

const commonDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "zoho.com",
];

export const verifyEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Extract username and domain
    const [username, domain] = email.split("@");

    // Check if domain is in allowed list
    if (!commonDomains.includes(domain.toLowerCase())) {
      throw new Error("Email domain not supported");
    }

    // Username validation
    if (username.length < 3) {
      throw new Error("Username too short");
    }

    // Additional username checks to catch obvious fake emails
    const obviousFakePatterns = [
      /^test/i,
      /^fake/i,
      /^[0-9]+$/, // only numbers
      /^(abc|xyz|123)/i,
      /^admin/i,
    ];

    for (const pattern of obviousFakePatterns) {
      if (pattern.test(username)) {
        throw new Error("Invalid email address");
      }
    }

    return true;
  } catch (error) {
    console.error("Email verification error:", error);
    throw error; // Re-throw to handle in the registration route
  }
};

// Update the sendVerificationEmail function to be more robust
export const sendVerificationEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification - Hotel Booking System",
    html: `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
