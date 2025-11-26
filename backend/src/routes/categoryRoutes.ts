import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "#controllers";

const categoryRoutes = Router();

categoryRoutes.post("/", createCategory);

categoryRoutes.get("/", getCategories);

categoryRoutes.get("/:id", getCategoryById);

categoryRoutes.put("/:id", updateCategory);

categoryRoutes.delete("/:id", deleteCategory);

export default categoryRoutes;
