import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getUserCategories,
} from "#controllers";
import { authenticate } from "#middlewares";

const categoryRoutes = Router();

categoryRoutes.post("/", createCategory);

categoryRoutes.get("/", getCategories);

categoryRoutes.get("/user", authenticate, getUserCategories);

categoryRoutes.get("/:id", getCategoryById);

categoryRoutes.put("/:id", updateCategory);

categoryRoutes.delete("/:id", deleteCategory);

export default categoryRoutes;
