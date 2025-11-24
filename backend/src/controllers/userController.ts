import { User } from "#models";
import bcrypt from "bcrypt";
import { changePasswordSchema, userInputSchema } from "#schemas";
import type { RequestHandler } from "express";

import type { z } from "zod/v4";

type UserInputDTO = z.infer<typeof userInputSchema>;
type UserDTO = UserInputDTO;
type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find();
    if (!users.length) {
      throw new Error("User not found", { cause: 404 });
    }
    res.json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateUser: RequestHandler<
  { id: string },
  UserDTO,
  UserInputDTO
> = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    profileImage,
    bio,
    skills,
    location,
    longitude,
    latitude,
  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      email,
      phone,
      profileImage,
      bio,
      skills,
      location,
      longitude,
      latitude,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("user not found", { cause: { status: 404 } });
  }
  res.status(200).json(updatedUser);
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const changePassword: RequestHandler<
  { id: string },
  { message: string },
  ChangePasswordDTO
> = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(id).select("+password");
  if (!user) {
    throw new Error("user not found", { cause: { status: 404 } });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect", { cause: { status: 400 } });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.clearCookie("accessToken");
  res
    .status(200)
    .json({ message: "Password changed successfully. Relogin required" });
};
