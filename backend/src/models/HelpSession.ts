import { Schema, model } from "mongoose";

const helpSessionSchema = new Schema({
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

export default model("HelpSession", helpSessionSchema);
