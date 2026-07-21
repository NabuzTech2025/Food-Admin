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
  clearAdminData: () => void;
  setStoreData: (data: Store) => void;
  setStoreId: (store_id: number | string | null) => void;
}

// Hydrated synchronously (not in a useEffect) so state is correct on the
// very first render — an effect-based hydration fires after child effects
// (e.g. StoreLayout syncing store_id from the route) and clobbers them.
const persisted = getSessionStorage("AdminData");

export const useAdminStore = create<AdminState>((set) => ({
  token: persisted?.token ?? null,
  role_id: persisted?.role_id ?? null,
  store_id: persisted?.store_id ?? null,
  store_type: persisted?.store_type ?? null,
  isAuthenticated: !!persisted,
  storeData: null,

  setAdminData: (data) =>
    set({
      token: data.token,
      role_id: data.role_id,
      store_id: data.store_id,
      store_type: data.store_type,
      isAuthenticated: true,
    }),

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

  setStoreId: (store_id) => set({ store_id }),
}));
