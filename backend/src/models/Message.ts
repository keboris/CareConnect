import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachements: [
      {
        type: Schema.Types.ObjectId,
        ref: "Media",
      },
    ],
    type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
  },
  { timestamps: { createdAt: true } }
);

export default model("Message", messageSchema);
