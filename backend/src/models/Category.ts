import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    color: {
      type: String,
      default: "#000000",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

//helpCategorySchema.index({ name: 1 });

export default model("Category", categorySchema);
