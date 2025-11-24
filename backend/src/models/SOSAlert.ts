import { Schema, model } from "mongoose";

const sosAlertSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    radius: {
      type: Number,
      default: 5, // in kilometers
    },
    type: {
      type: String,
      enum: ["medical", "danger", "fire", "police", "assistance", "other"],
      required: true,
    },
    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "resolved", "cancelled"],
      default: "active",
    },
  },
  { timestamps: { createdAt: true } }
);

export default model("SOSAlert", sosAlertSchema);
