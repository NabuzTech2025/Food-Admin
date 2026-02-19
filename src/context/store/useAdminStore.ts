// src/store/useAdminStore.ts
import { create } from "zustand";
import type { AdminStorageData } from "@/types/Admin.types";
import { getLocalStorage, removeLocalStorage } from "@/utils/storage";

interface AdminState {
  token: string | null;
  role_id: number | string | null;
  store_id: number | string | null;
  store_type: string | null;
  isAuthenticated: boolean;

  setAdminData: (data: AdminStorageData) => void;
  loadFromStorage: () => void;
  clearAdminData: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  token: null,
  role_id: null,
  store_id: null,
  store_type: null,
  isAuthenticated: false,

  setAdminData: (data) =>
    set({
      token: data.token,
      role_id: data.role_id,
      store_id: data.store_id,
      store_type: data.store_type,
      isAuthenticated: true,
    }),

  loadFromStorage: () => {
    const data = getLocalStorage("AdminData");
    if (data) {
      set({
        token: data.token,
        role_id: data.role_id,
        store_id: data.store_id,
        store_type: data.store_type,
        isAuthenticated: true,
      });
    }
  },

  clearAdminData: () => {
    removeLocalStorage("AdminData");
    set({
      token: null,
      role_id: null,
      store_id: null,
      store_type: null,
      isAuthenticated: false,
    });
  },
}));
