import { Schema, model } from "mongoose";

const helpRequestSchema = new Schema({
  sosId: {
    type: Schema.Types.ObjectId,
    ref: "SOSAlert",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  helperId: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["in_progress", "completed", "cancelled"],
    default: "in_progress",
  },
});

export default model("SOSHelpSession", helpRequestSchema);
