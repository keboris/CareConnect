import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    typeRequest: {
      type: String,
      enum: ["alert", "request"],
      default: "request",
    },
    title: {
      type: String,
      required: [
        function (this: any): boolean {
          return this.typeRequest === "request";
        },
        "Title is required",
      ],
      trim: true,
    },
    description: {
      type: String,
      required: [
        function (this: any): boolean {
          return this.typeRequest === "request";
        },
        "Description is required",
      ],
      default: function (this: any): string {
        return this.typeRequest === "alert" ? "SOS Alert" : "";
      },
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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
      required: function (this: any): boolean {
        return this.rewardType === "paid";
      },
      min: [0, "Price cannot be negative"],
    },
    radius: {
      type: Number,
      required: function (this: any): boolean {
        return this.typeRequest === "alert";
      },
      default: function (this: any): number {
        return this.typeRequest === "alert" ? 5 : 0;
      },
    },
    urgency: {
      type: String,
      enum: ["low", "normal", "high"],
      default: function (this: any): string {
        return this.typeRequest === "alert" ? "high" : "normal";
      },
    },
    typeAlert: {
      type: String,
      enum: ["medical", "danger", "fire", "police", "assistance", "other"],
      required: function (this: any): boolean {
        return this.typeRequest === "alert";
      },
      default: undefined,
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
      enum: ["active", "in_progress", "completed", "cancelled", "archived"],
      default: "active",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default model("Request", requestSchema);
