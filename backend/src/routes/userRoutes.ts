import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
  deleteProfileImage,
} from "#controllers";
import { authenticate, authorize, upload, validateBodyZod } from "#middlewares";
import { User } from "#models";
import {
  userInputSchema,
  changePasswordSchema,
  userUpdateSchema,
} from "#schemas";

const userRoutes = Router();

userRoutes.get("/", getUsers);

userRoutes.get("/:id", getUserById);

userRoutes.put(
  "/:id",
  authenticate,
  authorize(User),
  upload.single("image"),
  validateBodyZod(userUpdateSchema),
  updateUser
);

userRoutes.delete(
  "/:id/image",
  authenticate,
  authorize(User),
  deleteProfileImage
);

userRoutes.patch(
  "/:id",
  authenticate,
  authorize(User),
  validateBodyZod(changePasswordSchema),
  changePassword
);

userRoutes.delete("/:id", authenticate, authorize(User), deleteUser);

export default userRoutes;
