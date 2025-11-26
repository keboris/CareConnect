import { createHelpSession } from "#controllers";
import { authenticate } from "#middlewares";
import { Router } from "express";

const helpSessionRoutes = Router();

helpSessionRoutes.post("/:resourceId", authenticate, createHelpSession);

export default helpSessionRoutes;
