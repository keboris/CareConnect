import {
  createLanguage,
  deleteLanguage,
  getLanguageById,
  getLanguages,
  updateLanguage,
} from "#controllers";

import { Router } from "express";

const langRoutes = Router();

langRoutes.post("/", createLanguage);

langRoutes.get("/", getLanguages);

langRoutes.get("/:id", getLanguageById);
langRoutes.put("/:id", updateLanguage);

langRoutes.delete("/:id", deleteLanguage);

export default langRoutes;
