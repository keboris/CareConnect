import { z } from "zod";

// User Schemas
//----------------------------------------------------------------------------
// User Input Schema
export const userInputSchema = z
  .object({
    firstName: z
      .string({ error: "First Name must be a string" })
      .min(2, { message: "First Name must be at least 2 chars long" }),

    lastName: z
      .string({ error: "Last Name must be a string" })
      .min(2, { message: "Last Name must be at least 2 chars long" }),
    email: z
      .string({ error: "Email must be a string" })
      .email({ message: "Email must be a valid email address" }),
    password: z
      .string({ error: "Password must be a string" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(64, { message: "Password must be at most 64 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    phone: z
      .string({ error: "Phone must be a string" })
      .min(10, { message: "Phone must be at least 10 chars long" }),
    profileImage: z.string().url().optional(),
    profileImagePublicId: z.string().optional(),
    bio: z
      .string({ error: "Bio must be a string" })
      .max(500, { message: "Bio must be at most 500 characters long" })
      .optional(),
    skills: z
      .array(
        z
          .string({ error: "Skill must be a string" })
          .min(24, { message: "Skill must be a valid ID" })
      )
      .optional(),
    location: z
      .string({ error: "Location must be a string" })
      .min(2, { message: "Location must be a valid address" }),
    longitude: z.preprocess(
      (val) => parseFloat(val as string),
      z.number({ error: "Longitude must be a number" })
    ),
    latitude: z.preprocess(
      (val) => parseFloat(val as string),
      z.number({ error: "Latitude must be a number" })
    ),
    languages: z
      .array(
        z.string({ error: "Language must be a string" }).min(24, {
          message: "Language must be a valid ID",
        })
      )
      .min(1, { message: "At least one language must be selected" })
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
    bio: z
      .string({ error: "bio must be a string" })
      .max(500, { message: "bio must be at most 500 characters long" })
      .optional(),
    skills: z
      .array(
        z.string({ error: "skill must be a string" }).min(24, {
          message: "skill must be a valid ID",
        })
      )
      .optional(),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" })
      .optional(),
    longitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Longitude must be a number" })
      )
      .optional(),
    latitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Latitude must be a number" })
      )
      .optional(),
    languages: z
      .array(
        z.string({ error: "language must be a string" }).min(24, {
          message: "language must be a valid ID",
        })
      )
      .optional(),
  })
  .strict();
// Login Schema
export const authLoginSchema = z
  .object({
    email: z.string({ error: "Email must be a string" }).email({
      message: "Email must be a valid email address",
    }),
    password: z
      .string({ error: "Password must be a string" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(64, { message: "Password must be at most 64 characters long" }),
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
    name: z.string({ error: "Name must be a string" }),
    nameDE: z.string({ error: "Name in German must be a string" }).optional(),
    nameFR: z.string({ error: "Name in French must be a string" }).optional(),
    description: z.string({ error: "Description must be a string" }).optional(),
    descriptionDE: z
      .string({ error: "Description in German must be a string" })
      .optional(),
    descriptionFR: z
      .string({ error: "Description in French must be a string" })
      .optional(),
    icon: z.string({ error: "Icon must be a string" }).optional(),
    color: z.string({ error: "Color must be a string" }).optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Help Offer Schema
export const offerInputSchema = z
  .object({
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
      .preprocess(
        (val) => parseFloat(val as string),
        z
          .number({ error: "Price must be a number or greater than 0" })
          .min(0, { message: "Price cannot be negative" })
      )
      .optional(),
    location: z
      .string({ error: "Location must be a string" })
      .min(2, { message: "Location must be at least 2 chars long" })
      .optional(),
    longitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Longitude must be a number" })
      )
      .optional(),
    latitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Latitude must be a number" })
      )
      .optional(),
    images: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
  })
  .strict();

export const offerUpdateSchema = z
  .object({
    title: z
      .string({ error: "title must be a string" })
      .min(5, { message: "title must be at least 5 characters long" })
      .optional(),
    description: z
      .string({ error: "description must be a string" })
      .min(10, { message: "description must be at least 10 characters long" })
      .optional(),
    category: z
      .string({ error: "category must be a string" })
      .min(24, { message: "category must be a valid ID" })
      .optional(),
    isPaid: z
      .boolean({ error: "isPaid must be a boolean" })
      .default(false)
      .optional(),
    price: z
      .preprocess(
        (val) => parseFloat(val as string),
        z
          .number({ error: "Price must be a number or greater than 0" })
          .min(0, { message: "Price cannot be negative" })
      )
      .optional(),
    location: z
      .string({ error: "Location must be a string" })
      .min(2, { message: "Location must be at least 2 chars long" })
      .optional(),
    longitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Longitude must be a number" })
      )
      .optional(),
    latitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Latitude must be a number" })
      )
      .optional(),
    images: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
    status: z
      .enum(["active", "in_progress", "completed", "inactive", "archived"], {
        error:
          "status must be one of 'active', 'in_progress', 'completed', 'inactive', 'archived'",
      })
      .optional(),
  })
  .strict();

//----------------------------------------------------------------------------
// Help Request Schema
export const requestInputSchema = z
  .object({
    typeRequest: z.enum(["request", "alert"]).default("request"),
    title: z.string({ error: "title must be a string" }).optional(),
    description: z.string({ error: "description must be a string" }).optional(),
    category: z
      .string({ error: "Category must be a string" })
      .min(24, { message: "Category must be a valid ID" }),
    location: z
      .string({ error: "Location must be a string" })
      .min(2, { message: "Location must be at least 2 chars long" })
      .optional(),
    longitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Longitude must be a number" })
      )
      .optional(),
    latitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Latitude must be a number" })
      )
      .optional(),
    rewardType: z
      .enum(["free", "paid"], {
        error: "rewardType must be either 'free' or 'paid'",
      })
      .default("free")
      .optional(),
    price: z
      .preprocess(
        (val) => parseFloat(val as string),
        z
          .number({ error: "Price must be a number or greater than 0" })
          .min(0, { message: "Price cannot be negative" })
      )
      .optional(),
    radius: z
      .preprocess(
        (val) => parseFloat(val as string),
        z
          .number({ error: "radius must be a number" })
          .min(100, { message: "radius must be at least 100 meters" })
          .max(10000, { message: "radius must be at most 10000 meters" })
      )
      .optional(),
    urgency: z
      .enum(["low", "normal", "high"], {
        error: "urgency must be one of 'low', 'normal', 'high'",
      })
      .optional(),
    typeAlert: z.string({ error: "typeAlert must be a string" }).optional(),
    images: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeRequest === "request") {
      // validate title for request type
      if (!data.title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Title is required for typeRequest 'request'",
          path: ["title"],
        });
      } else {
        if (data.title.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Title must be at least 5 characters long for typeRequest 'request'",
            path: ["title"],
          });
        }
      }

      // validate description for request type
      if (!data.description) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Description is required for typeRequest 'request'",
          path: ["description"],
        });
      } else {
        if (data.description.length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Description must be at least 10 characters long for typeRequest 'request'",
            path: ["description"],
          });
        }
      }
    }
    if (data.typeRequest === "alert") {
      if (!data.title) data.title = "SOS Alert";
      if (!data.description) data.description = "SOS Alert";
      if (!data.radius) data.radius = 500;
      if (!data.typeAlert) data.typeAlert = "other";
    }
  })
  .strict();

export const requestUpdateSchema = z
  .object({
    typeRequest: z.enum(["request", "alert"]).optional(),
    title: z.string({ error: "title must be a string" }).optional(),
    description: z.string({ error: "description must be a string" }).optional(),
    category: z
      .string({ error: "category must be a string" })
      .min(24, { message: "category must be a valid ID" })
      .optional(),
    location: z
      .string({ error: "location must be a string" })
      .min(2, { message: "location must be at least 2 chars long" })
      .optional(),
    longitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Longitude must be a number" })
      )
      .optional(),
    latitude: z
      .preprocess(
        (val) => parseFloat(val as string),
        z.number({ error: "Latitude must be a number" })
      )
      .optional(),
    rewardType: z
      .enum(["free", "paid"], {
        error: "rewardType must be either 'free' or 'paid'",
      })
      .default("free"),
    price: z
      .preprocess(
        (val) => parseFloat(val as string),
        z
          .number({ error: "Price must be a number or greater than 0" })
          .min(0, { message: "Price cannot be negative" })
      )
      .optional(),
    radius: z
      .preprocess(
        (val) => parseFloat(val as string),
        z
          .number({ error: "radius must be a number" })
          .min(100, { message: "radius must be at least 100 meters" })
          .max(10000, { message: "radius must be at most 10000 meters" })
      )
      .optional(),
    urgency: z
      .enum(["low", "normal", "high"], {
        error: "urgency must be one of 'low', 'normal', 'high'",
      })
      .optional(),
    typeAlert: z.string({ error: "typeAlert must be a string" }).optional(),
    images: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
    status: z
      .enum(["active", "in_progress", "completed", "inactive", "cancelled"], {
        error:
          "status must be one of 'active', 'in_progress', 'completed', 'inactive', 'cancelled'",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeRequest === "request") {
      // validate title for request type
      if (!data.title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Title is required for typeRequest 'request'",
          path: ["title"],
        });
      } else {
        if (data.title.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Title must be at least 5 characters long for typeRequest 'request'",
            path: ["title"],
          });
        }
      }

      // validate description for request type
      if (!data.description) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Description is required for typeRequest 'request'",
          path: ["description"],
        });
      } else {
        if (data.description.length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Description must be at least 10 characters long for typeRequest 'request'",
            path: ["description"],
          });
        }
      }
    }
  })
  .strict();

//
export const helpSessionInputSchema = z
  .object({
    status: z.enum(["active", "completed", "cancelled"], {
      error: "status must be one of 'active', 'completed', 'cancelled'",
    }),
    result: z
      .enum(["successful", "unsuccessful", "partial", "undefined"], {
        error:
          "result must be one of 'successful', 'unsuccessful', 'partial', 'undefined'",
      })
      .optional(),
    ratingPending: z
      .boolean({ error: "ratingPending must be a boolean" })
      .optional(),
    rating: z
      .number({ error: "rating must be a number" })
      .min(1, { message: "rating must be at least 1" })
      .max(5, { message: "rating must be at most 5" })
      .optional(),
    notes: z
      .string({ error: "notes must be a string" })
      .max(2000, { message: "notes must be at most 2000 characters long" })
      .optional(),
    finalizedBy: z
      .string({ error: "finalizedBy must be a string" })
      .min(24, { message: "finalizedBy must be a valid ID" })
      .optional(),
    endedAt: z.date().optional(),
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

// Languages Schema
export const langInputSchema = z
  .object({
    en: z
      .string({ error: "name must be a string" })
      .min(2, { message: "name must be at least 2 characters long" }),
    de: z
      .string({ error: "name must be a string" })
      .min(2, { message: "name must be at least 2 characters long" })
      .optional(),
    fr: z
      .string({ error: "name must be a string" })
      .min(2, { message: "name must be at least 2 characters long" })
      .optional(),
  })
  .strict();

// Chat Message Schema
export const chatMessageInputSchema = z
  .object({
    sessionId: z
      .string({ error: "sessionId must be a string" })
      .min(24, { message: "sessionId must be a valid ID" }),
    senderId: z
      .string({ error: "senderId must be a string" })
      .min(24, { message: "senderId must be a valid ID" }),
    receiverId: z
      .string({ error: "receiverId must be a string" })
      .min(24, { message: "receiverId must be a valid ID" }),
    content: z
      .string({ error: "content must be a string" })
      .min(1, { message: "content cannot be empty" }),
    attachements: z
      .array(
        z
          .string({ error: "each image must be a string" })
          .url({ message: "each image must be a valid URL" })
      )
      .optional(),
  })
  .strict();

export const chatMessageUpdateSchema = z
  .object({
    content: z
      .string({ error: "content must be a string" })
      .min(1, { message: "content cannot be empty" })
      .optional(),
    isRead: z.boolean({ error: "isRead must be a boolean" }).optional(),
  })
  .strict();

//----------------------------------------------------------------------------
