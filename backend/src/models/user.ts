import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../shared/types";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  profilePicture: { type: String },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
  isActive: { type: Boolean, default: true },
  deactivatedAt: { type: Date },
  deactivationReason: { type: String },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
