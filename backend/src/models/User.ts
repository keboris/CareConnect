import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email is not valid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "helper", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      minlength: [10, "Phone number must be at least 10 characters long"],
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    profileImagePublicId: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    rating: {
      type: Number,
      min: 0,
    },
    languages: {
      type: [String],
      enum: ["English", "Spanish", "French", "German", "Chinese", "Other"],
      default: ["English"],
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },

  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model("User", userSchema);
