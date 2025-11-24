import { Schema, model } from "mongoose";

const logSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: { createdAt: true } }
);

export default model("Log", logSchema);
