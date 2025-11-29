import { Schema, model } from "mongoose";

const chatMessageSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "HelpSession",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachements: {
      type: [String],
      default: [],
    },
    attachementsPublicIds: {
      type: [String],
      default: [],
    },
    notifId: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default model("ChatMessage", chatMessageSchema);
