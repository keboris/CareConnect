// API Configuration for MongoDB Backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "helper" | "admin";
  phone: string;
  profileImage: string;
  profileImagePublicId: string;
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
  icon: string;
  color: string;
  description: string;
  createdAt: string;
};

export type Offer = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string | Category;
  isPaid: boolean;
  price?: number;
  location: string;
  longitude: number;
  latitude: number;
  availability: "available" | "unavailable";
  images: string[];
  imagesPublicIds: string[];
  status: "active" | "paused" | "archived";
  user?: User;
  createdAt: string;
  updatedAt: string;
};

export type Request = {
  _id: string;
  userId: string;
  typeRequest: "alert" | "request";
  title?: string;
  description: string;
  category: string | Category;
  location: string;
  longitude: number;
  latitude: number;
  rewardType: "free" | "paid";
  price?: number;
  radius?: number;
  urgency: "low" | "normal" | "high";
  typeAlert?: "medical" | "danger" | "fire" | "police" | "assistance" | "other";
  images: string[];
  imagesPublicIds: string[];
  status: "open" | "in_progress" | "completed" | "cancelled";
  user?: User;
  createdAt: string;
  updatedAt: string;
};
