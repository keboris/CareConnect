import { Schema, model } from "mongoose";

const skillSchema = new Schema(
  {
    en: {
      type: String,
      required: [true, "Skill name in English is required"],
      unique: true,
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

export default model("Skill", skillSchema);
