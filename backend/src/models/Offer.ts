import { Schema, model } from "mongoose";

const offerSchema = new Schema(
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
      ref: "Category",
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: function () {
        return this.isPaid;
      },
      min: [0, "Price cannot be negative"],
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
    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    images: {
      type: [String],
      default: [],
    },
    imagesPublicIds: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default model("Offer", offerSchema);
