import { create } from "zustand";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const API_URL = API_ENDPOINTS.AUTH;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  signin: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing in",
        isLoading: false,
      });
      throw error;
    }
  },

  signout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing out",
        isLoading: false,
      });
      throw error;
    }
  },

  // Digunakan oleh ProtectRoute untuk memverifikasi sesi admin.
  // Memanggil GET /auth/me — cookie httpOnly dikirim otomatis oleh browser.
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axios.get(`${API_URL}/me`);
      set({
        user: response.data.data,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      return true;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
      return false;
    }
  },
}));

