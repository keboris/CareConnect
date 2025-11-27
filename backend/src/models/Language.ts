import { Schema, model } from "mongoose";

const languageSchema = new Schema(
  {
    en: {
      type: String,
      required: [true, "English translation is required"],
      trim: true,
    },
    de: {
      type: String,
      default: "",
      trim: true,
    },
    fr: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model("Language", languageSchema);
