import { Schema, model } from "mongoose";

const helpSessionSchema = new Schema(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request",
      default: null,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },
    userRequesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userHelperId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    result: {
      type: String,
      enum: ["successful", "unsuccessful", "partial", "undefined"],
      default: "undefined",
    },
    ratingPending: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      maxLength: 2000,
    },
    finalizedBy: {
      type: String,
      enum: ["requester", "helper", "system", "none"],
      default: "none",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default model("HelpSession", helpSessionSchema);
