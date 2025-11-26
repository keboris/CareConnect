// API Configuration for MongoDB Backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  location: string;
  longitude?: number;
  latitude?: number;
  rating: number;
  languages?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Offer = {
  id: string;
  userId: string;
  title: string;
  description: string;
  categoryId: string;
  isPaid: boolean;
  price?: number;
  location: string;
  longitude: number;
  latitude: number;
  availability: "available" | "unavailable";
  images?: string[];
  status: "active" | "paused" | "archived";
  user?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type Request = {
  id: string;
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
  urgencyLevel?: "low" | "medium" | "high";
  typeAlert?: "medical" | "safety" | "other";
  images?: string[];
  status: "open" | "in_progress" | "completed" | "cancelled";
  user?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

/*export type Conversation = {
  id: string;
  listing_id: string;
  requester_id: string;
  helper_id: string;
  last_message_at: string;
  created_at: string;
  listing?: Listing;
  requester?: Profile;
  helper?: Profile;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
};

export type Review = {
  id: string;
  listing_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Profile;
};*/
