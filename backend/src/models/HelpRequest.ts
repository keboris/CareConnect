import { Schema, model } from "mongoose";

const helpRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "HelpCategory",
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
    rewardType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    price: {
      type: Number,
      required: function () {
        return this.rewardType === "paid";
      },
      min: [0, "Price cannot be negative"],
    },
    urgency: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default model("HelpRequest", helpRequestSchema);
