import {
  createHelpSession,
  getHelpSession,
  updateHelpSession,
} from "#controllers";
import { authenticate, authorize } from "#middlewares";
import { HelpSession } from "#models";
import { Router } from "express";

const helpSessionRoutes = Router();

helpSessionRoutes.get("/", authenticate, getHelpSession);

helpSessionRoutes.put(
  "/:id",
  authenticate,
  authorize(HelpSession),
  updateHelpSession
);

export default helpSessionRoutes;
