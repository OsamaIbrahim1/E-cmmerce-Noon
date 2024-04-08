import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/system-role.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumbers: [{ type: String, required: true }],
    addresses: [{ type: String, required: true }],
    role: {
      type: String,
      enum: Object.values(systemRoles),
      default: systemRoles.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    isloggedIn: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
    forgetCode: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
