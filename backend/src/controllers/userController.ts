import {
  ChatMessage,
  HelpSession,
  Notification,
  Offer,
  Request,
  User,
} from "#models";
import bcrypt from "bcrypt";
import {
  changePasswordSchema,
  userInputSchema,
  userUpdateSchema,
} from "#schemas";
import type { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";

import type { z } from "zod/v4";
import mongoose from "mongoose";
import { normalizePhone } from "#utils";

type UserUpdateDTO = z.infer<typeof userUpdateSchema>;
type UserDTO = UserUpdateDTO;
type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
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

export const getUserStatsById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log(`Fetching stats for user: ${userId}`);
    if (!userId) {
      console.log(`Unauthorized access attempt to user stats by ${userId}`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const [offersCount, requestsCount, alertsCount, notificationsCount] =
      await Promise.all([
        Offer.countDocuments({ userId: { $ne: userId } }),
        Request.countDocuments({ userId: { $ne: userId } }).where(
          "typeRequest",
          "request"
        ),
        Request.countDocuments({ userId: { $ne: userId } }).where(
          "typeRequest",
          "alert"
        ),
        Notification.countDocuments({ userId }),
      ]);

    const chatsCount = await ChatMessage.distinct("sessionId", {
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).then((sessions) => sessions.length);

    const unreadCount = await ChatMessage.countDocuments({
      receiverId: userId,
      isRead: false,
    });

    const helpSessions = await HelpSession.find({
      $or: [{ userRequesterId: userId }, { userHelperId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const helpSessionsCount = helpSessions.length;

    return res.json({
      user,
      stats: {
        offers: offersCount,
        requests: requestsCount,
        alerts: alertsCount,
        chats: chatsCount,
        unRead: unreadCount,
        sessions: helpSessionsCount,
        notifications: notificationsCount,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getLocationsByUser: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;

    const userLocation = await User.findById(id).select(
      "location latitude longitude"
    );

    if (!userLocation) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fin all unique offer
    const offerLocations = await Offer.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: {
            latitude: "$latitude",
            longitude: "$longitude",
            location: "$location",
          },
        },
      },
      {
        $match: {
          $expr: {
            $not: [
              {
                $and: [
                  { $eq: ["$_id.latitude", userLocation.latitude] },
                  { $eq: ["$_id.longitude", userLocation.longitude] },
                ],
              },
            ],
          },
        },
      },
    ]);
    console.log(offerLocations);
    // Find all unique request locations
    const requestLocations = await Request.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: {
            latitude: "$latitude",
            longitude: "$longitude",
            location: "$location",
          },
        },
      },
      {
        $match: {
          $expr: {
            $not: {
              $and: [
                { $eq: ["$_id.latitude", userLocation.latitude] },
                { $eq: ["$_id.longitude", userLocation.longitude] },
              ],
            },
          },
        },
      },
    ]);

    // Merge and remove duplicates
    const merged = [...offerLocations, ...requestLocations].map(
      (loc) => loc._id
    );

    const uniqueLocations = Array.from(
      new Map(
        merged.map((loc) => [`${loc.latitude},${loc.longitude}`, loc])
      ).values()
    );

    res.status(200).json({
      locations: uniqueLocations,
    });
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
  { field?: string; message: string; user?: UserDTO },
  UserUpdateDTO
> = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    bio,
    skills,
    languages,
    location,
    longitude,
    latitude,
  } = req.body;

  const file = req.file as Express.Multer.File | undefined;

  if (phone) {
    const submittedPhone = normalizePhone(phone);
    const phoneExist = await User.exists({
      phone: submittedPhone,
      _id: { $ne: id },
    });

    if (phoneExist) {
      if (file?.filename && file?.filename.length > 0) {
        await cloudinary.uploader.destroy(file.filename);
      }
      return res
        .status(400)
        .json({ field: "phone", message: "Phone number already in use" });
    }
  }

  const searchProfile = await User.findById(id).select(
    "profileImage profileImagePublicId"
  );

  if (!searchProfile) {
    throw new Error("User not found", { cause: { status: 404 } });
  }

  let profileImage = searchProfile.profileImage;
  let profileImagePublicId = searchProfile.profileImagePublicId;

  profileImage = file?.path || "";
  profileImagePublicId = file?.filename || "";

  if (file?.filename && file?.filename.length > 0) {
    if (profileImagePublicId) {
      await cloudinary.uploader.destroy(profileImagePublicId);
    }

    profileImage = file.path;
    profileImagePublicId = file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      email,
      phone,
      profileImage,
      profileImagePublicId,
      bio,
      skills,
      languages,
      location,
      longitude,
      latitude,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("user not found", { cause: { status: 404 } });
  }

  // convert Mongoose document to plain object and normalize ObjectId[] -> string[]
  const userObj = updatedUser.toObject();

  const safeUser = {
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    phone: userObj.phone,
    profileImage: userObj.profileImage,
    profileImagePublicId: userObj.profileImagePublicId,
    bio: userObj.bio,
    skills: Array.isArray(userObj.skills)
      ? userObj.skills.map((s: any) =>
          s && typeof s === "object" && typeof s.toString === "function"
            ? s.toString()
            : s
        )
      : userObj.skills,
    languages: userObj.languages,
    location: userObj.location,
    longitude: userObj.longitude,
    latitude: userObj.latitude,
  } as unknown as UserDTO;

  res
    .status(200)
    .json({ message: "User updated successfully", user: safeUser });
};

export const deleteProfileImage: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const publicId = user.profileImagePublicId;
    if (!publicId) {
      return res.status(400).json({ message: "No profile image to delete" });
    }
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      return res
        .status(500)
        .json({ message: "Failed to delete image from Cloudinary" });
    }

    user.profileImage = "";
    user.profileImagePublicId = "";

    await user.save();
    res
      .status(200)
      .json({ message: "User profile image deleted successfully", user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const userProfile = await User.findById(id).select("profileImagePublicId");
    if (userProfile && userProfile.profileImagePublicId) {
      const publicId = userProfile.profileImagePublicId;
      await cloudinary.uploader.destroy(publicId);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
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
