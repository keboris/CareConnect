import { Schema, model } from "mongoose";

const help_SessionSchema = new Schema({
  requestId: {
    type: Schema.Types.ObjectId,
    ref: "HelpRequest",
    default: null,
  },
  offerId: {
    type: Schema.Types.ObjectId,
    ref: "HelpOffer",
    default: null,
  },
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  helperId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

export default model("Help_Session", help_SessionSchema);
