// API Configuration for MongoDB Backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  phone: string;
  profileImage: string;
  bio: string;
  skills: string[];
  location: string;
  longitude: number;
  latitude: number;
  rating?: number;
  languages: string[];
  createdAt: string;
};

export type Category = {
  _id: string;
  name: string;
  icon?: string;
  color: string;
  description: string;
  createdAt: string;
};

export type Offer = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  categoryId: string;
  isPaid: boolean;
  price?: number;
  location: string;
  longitude: number;
  latitude: number;
  images: string[];
  status:
    | "active"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "inactive"
    | "archived";
  user?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type Request = {
  _id: string;
  userId: string;
  typeRequest: "alert" | "request";
  title?: string;
  description: string;
  categoryId: string;
  location: string;
  longitude: number;
  latitude: number;
  rewardType: "free" | "paid";
  price?: number;
  radius?: number;
  urgency: "low" | "normal" | "high";
  typeAlert?: "medical" | "danger" | "fire" | "police" | "assistance" | "other";
  images: string[];
  status:
    | "active"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "inactive"
    | "archived";
  user?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};
