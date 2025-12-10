import { login, logoutAll, refresh, register, me, logout } from "#controllers";
import { authenticate, upload, validateBodyZod } from "#middlewares";
import { authLoginSchema, userInputSchema } from "#schemas";
import { Router } from "express";

const authRoutes = Router();

authRoutes.post(
  "/register",
  upload.single("profileImage"),
  validateBodyZod(userInputSchema),
  register
);
authRoutes.post("/login", validateBodyZod(authLoginSchema), login);
authRoutes.post("/refresh", refresh);

authRoutes.get("/me", authenticate, me);

authRoutes.delete("/logout", authenticate, logout);
authRoutes.delete("/logout-all", authenticate, logoutAll);

export default authRoutes;
