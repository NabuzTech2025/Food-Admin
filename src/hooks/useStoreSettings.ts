import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreSettings,
  addStoreSettings,
  updateStoreSettings,
} from "@/api/storeSettings";
import type { StoreSettings, StoreSettingsPayload } from "@/api/storeSettings";

const STORE_SETTINGS_KEY = "store-settings";

// Get
export const useGetStoreSettings = (storeId: number | string | null) => {
  return useQuery({
    queryKey: [STORE_SETTINGS_KEY, storeId],
    queryFn: () => getStoreSettings(storeId!),
    enabled: !!storeId,
  });
};

// Create
export const useAddStoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreSettingsPayload) => addStoreSettings(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STORE_SETTINGS_KEY, variables.store_id],
      });
    },
  });
};

// Update
export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StoreSettings }) =>
      updateStoreSettings(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STORE_SETTINGS_KEY, variables.payload.store_id],
      });
    },
  });
};
