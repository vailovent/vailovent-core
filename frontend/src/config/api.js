import axios from "axios";

/**
 * Centralized API Configuration
 *
 * Mengambil base URL dari environment variable Vite (VITE_API_URL).
 * Jika tidak didefinisikan (misalnya saat build default), menggunakan fallback ke production backend.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://backend-vailovent.vercel.app/api/v1";

/**
 * Endpoint definitions for all features
 */
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  PRODUCTS: `${API_BASE_URL}/products`,
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  MIDTRANS: `${API_BASE_URL}/midtrans`,
  ADMIN: `${API_BASE_URL}/admin`,
  TERMS_AND_CONDITIONS: `${API_BASE_URL}/termsAndConditions`,
};

// Global axios default config
axios.defaults.withCredentials = true;

export default API_ENDPOINTS;
