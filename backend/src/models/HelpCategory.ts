import { Schema, model } from "mongoose";

const helpCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

//helpCategorySchema.index({ name: 1 });

export default model("HelpCategory", helpCategorySchema);
