import axios from "axios";
import { create } from "zustand";
import { API_ENDPOINTS } from "../config/api";

const API_URL = API_ENDPOINTS.TERMS_AND_CONDITIONS;

export const useTermsAndConditionsStore = create((set) => ({
  termsAndConditions: [],
  error: null,
  isLoading: false,

  fetchTermsAndConditions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      set({
        termsAndConditions: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
      set({
        error:
          error.response?.data.message || "Error fetching terms and conditions",
        isLoading: false,
      });
    }
  },
}));
