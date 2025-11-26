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
    enum: ["active", "in_progress", "completed", "cancelled"],
    default: "active",
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
