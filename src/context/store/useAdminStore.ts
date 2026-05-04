// src/store/useAdminStore.ts
import { create } from "zustand";
import type { AdminStorageData } from "@/types/Admin.types";
import type { Store } from "@/api/Currentstore";
import { getSessionStorage, removeSessionStorage } from "@/utils/storage";

interface AdminState {
  token: string | null;
  role_id: number | string | null;
  store_id: number | string | null;
  store_type: string | null;
  isAuthenticated: boolean;
  storeData: Store | null;

  setAdminData: (data: AdminStorageData) => void;
  loadFromStorage: () => void;
  clearAdminData: () => void;
  setStoreData: (data: Store) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  token: null,
  role_id: null,
  store_id: null,
  store_type: null,
  isAuthenticated: false,
  storeData: null,

  setAdminData: (data) =>
    set({
      token: data.token,
      role_id: data.role_id,
      store_id: data.store_id,
      store_type: data.store_type,
      isAuthenticated: true,
    }),

  loadFromStorage: () => {
    const data = getSessionStorage("AdminData");
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
    removeSessionStorage("AdminData");
    set({
      token: null,
      role_id: null,
      store_id: null,
      store_type: null,
      isAuthenticated: false,
      storeData: null,
    });
  },

  setStoreData: (data) => set({ storeData: data }),
}));
