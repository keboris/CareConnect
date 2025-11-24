import { Schema, model } from "mongoose";

const ratingSchema = new Schema(
  {
    raterUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    raterByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Help_Session",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default model("Rating", ratingSchema);
