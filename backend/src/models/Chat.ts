import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    relatedType: {
      type: String,
      enum: ["helpRequest", "helpOffer", "sos", "general"],
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: function () {
        if (this.relatedType === "helpRequest") return "HelpRequest";
        if (this.relatedType === "helpOffer") return "HelpOffer";
        if (this.relatedType === "sos") return "SOSAlert";
        return null;
      },
    },
    lastMessage: {
      type: String,
      default: "",
    },
    unreadCounts: {
      type: Map,
      ref: "User",
      of: Number,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model("Chat", chatSchema);
