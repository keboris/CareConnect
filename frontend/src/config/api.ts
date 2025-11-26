// API Configuration for MongoDB Backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type User = {
  id: string;
  email: string;
  full_name: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  is_paid: boolean;
  price?: number;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  postal_code: string;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  profile?: Profile;
  category?: Category;
};

export type Conversation = {
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
};
