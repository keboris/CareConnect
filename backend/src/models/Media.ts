import { Schema, model } from "mongoose";

const mediaSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: [true, "Media type is required"],
      enum: ["image", "video", "audio", "document"],
      default: "image",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: { createdAt: true } }
);

export default model("Media", mediaSchema);
