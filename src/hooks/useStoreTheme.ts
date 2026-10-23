import {
  getStoreTheme,
  saveStoreTheme,
  type StoreTheme,
} from "@/api/storeTheme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const THEME_KEY = "store-theme";

export const useGetStoreTheme = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [THEME_KEY, store_id],
    queryFn: () => getStoreTheme(store_id!),
    enabled: !!store_id,
  });
};

export const useSaveStoreTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreTheme) => saveStoreTheme(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [THEME_KEY, data.store_id] });
    },
  });
};
