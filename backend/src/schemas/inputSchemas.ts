import { z } from "zod";

// User Schemas
//----------------------------------------------------------------------------
// User Input Schema
export const userInputSchema = z
  .object({
    firstName: z
      .string({ error: "firstName must be a string" })
      .min(2, { message: "firstName must be at least 2 chars long" }),

    lastName: z
      .string({ error: "lastName must be a string" })
      .min(2, { message: "lastName must be at least 2 chars long" }),
    email: z
      .string({ error: "email must be a string" })
      .email({ message: "email must be a valid email address" }),
    password: z
      .string({ error: "password must be a string" })
      .min(6, { message: "password must be at least 6 characters long" })
      .max(64, { message: "password must be at most 64 characters long" })
      .regex(/[A-Z]/, {
        message: "password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "password must contain at least one special character",
      }),
    phone: z
      .string({ error: "phone must be a string" })
      .min(10, { message: "phone must be at least 10 chars long" }),
    profileImage: z.string().url().optional(),
    profileImagePublicId: z.string().optional(),
    bio: z
      .string({ error: "bio must be a string" })
      .max(500, { message: "bio must be at most 500 characters long" })
      .optional(),
    skills: z
      .array(
        z.string({ error: "each skill must be a string" }).min(2, {
          message: "each skill must be at least 2 characters long",
        })
      )
      .optional(),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" }),
    longitude: z.number({ error: "longitude must be a number" }),
    latitude: z.number({ error: "latitude must be a number" }),
    languages: z
      .array(
        z.enum(["English", "Spanish", "French", "German", "Chinese", "Other"], {
          error: "language must be one of the predefined options",
        })
      )
      .min(1, { message: "at least one language must be selected" })
      .optional(),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    firstName: z
      .string({ error: "firstName must be a string" })
      .min(2, { message: "firstName must be at least 2 chars long" })
      .optional(),
    lastName: z
      .string({ error: "lastName must be a string" })
      .min(2, { message: "lastName must be at least 2 chars long" })
      .optional(),
    email: z
      .string({ error: "email must be a string" })
      .email({ message: "email must be a valid email address" })
      .optional(),
    phone: z
      .string({ error: "phone must be a string" })
      .min(10, { message: "phone must be at least 10 chars long" })
      .optional(),
    profileImage: z.string().url().optional(),
    profileImagePublicId: z.string().optional(),
    bio: z
      .string({ error: "bio must be a string" })
      .max(500, { message: "bio must be at most 500 characters long" })
      .optional(),
    skills: z
      .array(
        z.string({ error: "each skill must be a string" }).min(2, {
          message: "each skill must be at least 2 characters long",
        })
      )
      .optional(),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" })
      .optional(),
    longitude: z.number({ error: "longitude must be a number" }).optional(),
    latitude: z.number({ error: "latitude must be a number" }).optional(),
    languages: z
      .array(
        z.enum(["English", "Spanish", "French", "German", "Chinese", "Other"], {
          error: "language must be one of the predefined options",
        })
      )
      .min(1, { message: "at least one language must be selected" })
      .optional(),
  })
  .strict();
// Login Schema
export const authLoginSchema = z
  .object({
    email: z.string({ error: "email must be a string" }).email({
      message: "email must be a valid email address",
    }),
    password: z
      .string({ error: "password must be a string" })
      .min(6, { message: "password must be at least 6 characters long" })
      .max(64, { message: "password must be at most 64 characters long" }),
  })
  .strict();

// Change Password Schema
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ error: "oldPassword must be a string" })
      .min(6, { message: "oldPassword must be at least 6 characters long" })
      .max(64, { message: "oldPassword must be at most 64 characters long" }),
    newPassword: z
      .string({ error: "newPassword must be a string" })
      .min(6, { message: "newPassword must be at least 6 characters long" })
      .max(64, { message: "newPassword must be at most 64 characters long" })
      .regex(/[A-Z]/, {
        message: "newPassword must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "newPassword must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        message: "newPassword must contain at least one number",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "newPassword must contain at least one special character",
      }),
    confirmNewPassword: z
      .string({ error: "confirmNewPassword must be a string" })
      .min(6, {
        message: "confirmNewPassword must be at least 6 characters long",
      })
      .max(64, {
        message: "confirmNewPassword must be at most 64 characters long",
      }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "newPassword and confirmNewPassword must match",
  })
  .strict();

//----------------------------------------------------------------------------
// Category Schema
export const categoryInputSchema = z
  .object({
    name: z.string({ error: "name must be a string" }),
  })
  .strict();

//----------------------------------------------------------------------------
// Help Offer Schema
export const helpOfferInputSchema = z
  .object({
    userId: z
      .string({ error: "userId must be a string" })
      .min(24, { message: "userId must be a valid ID" }),
    title: z
      .string({ error: "title must be a string" })
      .min(5, { message: "title must be at least 5 characters long" }),
    description: z
      .string({ error: "description must be a string" })
      .min(10, { message: "description must be at least 10 characters long" }),
    category: z
      .string({ error: "category must be a string" })
      .min(24, { message: "category must be a valid ID" }),
    isPaid: z.boolean({ error: "isPaid must be a boolean" }).default(false),
    price: z
      .number({ error: "price must be a number" })
      .min(0, { message: "price cannot be negative" })
      .optional(),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" }),
    longitude: z.number({ error: "longitude must be a number" }),
    latitude: z.number({ error: "latitude must be a number" }),
    availability: z
      .enum(["available", "unavailable"], {
        error: "availability must be either 'available' or 'unavailable'",
      })
      .default("available"),
    images: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Help Request Schema
export const helpRequestInputSchema = z
  .object({
    userId: z
      .string({ error: "userId must be a string" })
      .min(24, { message: "userId must be a valid ID" }),
    title: z
      .string({ error: "title must be a string" })
      .min(5, { message: "title must be at least 5 characters long" }),
    description: z
      .string({ error: "description must be a string" })
      .min(10, { message: "description must be at least 10 characters long" }),
    category: z
      .string({ error: "category must be a string" })
      .min(24, { message: "category must be a valid ID" }),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" }),
    longitude: z.number({ error: "longitude must be a number" }),
    latitude: z.number({ error: "latitude must be a number" }),
    rewardType: z
      .enum(["free", "paid"], {
        error: "rewardType must be either 'free' or 'paid'",
      })
      .default("free"),
    price: z
      .number({ error: "price must be a number" })
      .min(0, { message: "price cannot be negative" })
      .optional(),
    urgency: z
      .enum(["low", "normal", "high"], {
        error: "urgency must be one of 'low', 'normal', 'high'",
      })
      .default("normal"),
    images: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Enreg Log Schema
export const enregLogInputSchema = z
  .object({
    userId: z
      .string({ error: "userId must be a string" })
      .min(24, { message: "userId must be a valid ID" }),
    action: z
      .string({ error: "action must be a string" })
      .min(5, { message: "action must be at least 5 characters long" }),
    details: z
      .string({ error: "details must be a string" })
      .min(5, { message: "details must be at least 5 characters long" })
      .optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Media Schema
export const mediaInputSchema = z
  .object({
    url: z
      .string({ error: "url must be a string" })
      .url({ message: "url must be a valid URL" }),
    type: z.enum(["image", "video", "audio", "document"], {
      error: "type must be one of 'image', 'video', 'audio', 'document'",
    }),
    description: z
      .string({ error: "description must be a string" })
      .min(5, { message: "description must be at least 5 characters long" })
      .optional(),
    uploadedBy: z
      .string({ error: "uploadedBy must be a string" })
      .min(24, { message: "uploadedBy must be a valid ID" }),
  })
  .strict();

//----------------------------------------------------------------------------
// SOS Alert Schema
export const sosAlertInputSchema = z
  .object({
    userId: z
      .string({ error: "userId must be a string" })
      .min(24, { message: "userId must be a valid ID" }),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" }),
    longitude: z.number({ error: "longitude must be a number" }),
    latitude: z.number({ error: "latitude must be a number" }),
    message: z
      .string({ error: "message must be a string" })
      .min(10, { message: "message must be at least 10 characters long" }),
    radius: z
      .number({ error: "radius must be a number" })
      .min(100, { message: "radius must be at least 100 meters" })
      .max(10000, { message: "radius must be at most 10000 meters" }),
    createdAt: z.date().optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Chat and Message Schemas
export const chatInputSchema = z
  .object({
    participants: z
      .array(
        z.string({ error: "participantId must be a string" }).min(24, {
          message: "participantId must be a valid ID",
        })
      )
      .min(2, { message: "At least two participants are required" }),
    relatedType: z
      .enum(["helpRequest", "helpOffer", "sos", "general"], {
        error:
          "relatedType must be one of 'helpRequest', 'helpOffer', 'sos', 'general'",
      })
      .optional(),
    relatedId: z
      .string({ error: "relatedId must be a string" })
      .min(24, { message: "relatedId must be a valid ID" })
      .optional(),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .strict();

export const messageInputSchema = z
  .object({
    chatId: z
      .string({ error: "chatId must be a string" })
      .min(24, { message: "chatId must be a valid ID" }),
    senderId: z
      .string({ error: "senderId must be a string" })
      .min(24, { message: "senderId must be a valid ID" }),

    content: z
      .string({ error: "content must be a string" })
      .min(1, { message: "content cannot be empty" }),
    attachements: z
      .array(
        z
          .string({ error: "each attachement must be a string" })
          .min(24, { message: "each attachement must be a valid ID" })
      )
      .optional(),
    createdAt: z.date().optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Notification Schema
export const notificationInputSchema = z
  .object({
    userId: z
      .string({ error: "userId must be a string" })
      .min(24, { message: "userId must be a valid ID" }),
    title: z.string({ error: "title must be a string" }).optional(),
    message: z
      .string({ error: "message must be a string" })
      .min(1, { message: "message cannot be empty" }),
    type: z.enum(["request", "offer", "sos", "session", "chat", "system"], {
      error:
        "type must be one of 'request', 'offer', 'sos', 'session', 'chat', 'system'",
    }),

    isRead: z.boolean({ error: "isRead must be a boolean" }).default(false),
    createdAt: z.date().optional(),
  })
  .strict();
//----------------------------------------------------------------------------
