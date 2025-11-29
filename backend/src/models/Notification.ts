import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resourceModel: {
      type: String,
      enum: ["Offer", "Request", "HelpSession"],
      default: null,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      refPath: "resourceModel",
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["request", "offer", "sos", "session", "chat", "system"],
      default: "system",
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true } }
);

export default model("Notification", notificationSchema);
