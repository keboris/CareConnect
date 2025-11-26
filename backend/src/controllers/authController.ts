import { User } from "#models";
import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import type { authLoginSchema, userInputSchema } from "#schemas";
import type z from "zod";
import { accessCookieOpts, refreshCookieOpts, signAccessToken } from "#utils";
import jwt from "jsonwebtoken";

type RegisterDTO = z.infer<typeof userInputSchema>;
type LoginDTO = z.infer<typeof authLoginSchema>;

/*------------------------------- REGISTER ------------------------------*/
export const register: RequestHandler<
  unknown,
  { message: string; user: any; token: string },
  RegisterDTO
> = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    bio,
    skills,
    languages,
    location,
    longitude,
    latitude,
  } = req.body;

  const userExist = await User.exists({ email });

  if (userExist) {
    throw new Error("Registration failed", { cause: { status: 400 } });
  }

  const hash = await bcrypt.hash(password, 10);

  const file = req.file as Express.Multer.File | undefined;
  const profileImage = file?.path || "";
  const profileImagePublicId = file?.filename || "";

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hash,
    phone,
    profileImage: profileImage,
    profileImagePublicId: profileImagePublicId,
    bio,
    skills,
    languages,
    location,
    longitude,
    latitude,
  });

  const accessToken = signAccessToken({
    jti: user._id.toString(),
    roles: user.role,
  });

  res.cookie("accessToken", accessToken, accessCookieOpts).status(201).json({
    message: "User registered successfully",
    user,
    token: accessToken,
  });
};

/*------------------------------- LOGIN ------------------------------*/
export const login: RequestHandler<
  unknown,
  { message: string; user: any; accessToken: string; refreshToken: string },
  LoginDTO
> = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Login failed. Invalid Credentials", {
      cause: { status: 400 },
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Login failed. Invalid Credentials", {
      cause: { status: 400 },
    });
  }

  const accessToken = signAccessToken({
    jti: user._id.toString(),
    roles: user.role,
    ver: user.tokenVersion,
  });

  const refreshToken = signAccessToken({
    jti: user._id.toString(),
    roles: user.role,
    ver: user.tokenVersion,
  });

  const { password: _, ...userWithoutPassword } = user.toObject();

  res
    .cookie("accessToken", accessToken, accessCookieOpts)
    .cookie("refreshToken", refreshToken, refreshCookieOpts)
    .status(200)
    .json({
      message: "User logged in successfully",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
};

/*------------------------------- REFRESH TOKEN ------------------------------*/
export const refresh: RequestHandler<
  unknown,
  { message: string; accessToken: string; refreshToken: string }
> = async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new Error("No refresh token provided", { cause: { status: 401 } });
  }

  console.log("🔄 Refreshing tokens with token:", token);
  let payload: jwt.JwtPayload & { jti: string; ver?: number };
  try {
    payload = jwt.verify(token, process.env.REFRESH_JWT_SECRET!) as any;
  } catch (err) {
    throw new Error("Invalid refresh token", { cause: { status: 401 } });
  }

  const user = await User.findById(payload.jti).select("+tokenVersion");
  if (!user) {
    throw new Error("User not found", { cause: { status: 404 } });
  }

  if (payload.ver !== undefined && payload.ver !== user.tokenVersion) {
    return next(
      new Error("Refresh token has been revoked", { cause: { status: 401 } })
    );
  }

  const newAccess = signAccessToken({
    jti: user._id.toString(),
    roles: user.role,
    ver: user.tokenVersion,
  });

  const newRefresh = signAccessToken({
    jti: user._id.toString(),
    roles: user.role,
  });

  res
    .cookie("accessToken", newAccess, accessCookieOpts)
    .cookie("refreshToken", newRefresh, refreshCookieOpts)
    .json({
      message: "Tokens refreshed successfully",
      accessToken: newAccess,
      refreshToken: newRefresh,
    });
};

/*------------------------------- LOGOUT & ME ------------------------------*/
export const logout: RequestHandler = async (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logout successfuly" });
};

/*------------------------------- LOGOUT ALL DEVICES ------------------------------*/
export const logoutAll: RequestHandler = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new Error("unauthorized", { cause: { status: 400 } });
  }

  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logout from all devices successfuly" });
};

/*------------------------------- ME ------------------------------*/
export const me: RequestHandler<unknown, { user: any }> = async (req, res) => {
  const userId = req.user?.id;
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found", { cause: { status: 404 } });

  res.json({ user });
};
