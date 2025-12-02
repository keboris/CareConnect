// API Configuration for MongoDB Backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const USER_API_URL = `${API_BASE_URL}/users`;
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const OFFER_API_URL = `${API_BASE_URL}/offers`;
export const REQUEST_API_URL = `${API_BASE_URL}/requests`;
export const NOTIFICATION_API_URL = `${API_BASE_URL}/notifications`;
export const CATEGORIE_API_URL = `${API_BASE_URL}/categories`;
export const CAT_USER_API_URL = `${API_BASE_URL}/categories/user`;
export const CHAT_API_URL = `${API_BASE_URL}/chats`;
export const STAT_USER_API_URL = `${API_BASE_URL}/users/stats`;
