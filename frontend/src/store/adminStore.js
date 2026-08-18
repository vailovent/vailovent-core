import { create } from "zustand";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const API_URL = API_ENDPOINTS.ADMIN;

export const useAdminStore = create((set) => ({
  error: null,
  isLoading: false,
  transactions: [],

  updateTransactionCookingStatus: async (transaction_id, cooking_status) => {
    set({ isLoading: true, error: null });

    try {
      if (!transaction_id) {
        throw new Error("Transaction ID is required!");
      }

      const response = await axios.put(
        `${API_URL}/update-cooking-status/${transaction_id}`,
        { cooking_status },
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to update status!");
      }

      // Update local transactions state
      set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx._id === transaction_id ? { ...tx, cooking_status } : tx,
        ),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
