import {
  createThemePreset,
  deleteThemePreset,
  getStoreTheme,
  getThemePresets,
  saveStoreTheme,
  updateThemePreset,
  type StoreTheme,
} from "@/api/storeTheme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const THEME_KEY = "store-theme";
const PRESETS_KEY = "theme-presets";

export const useGetThemePresets = () => {
  return useQuery({
    queryKey: [PRESETS_KEY],
    queryFn: getThemePresets,
    staleTime: 1000 * 60 * 60, // presets rarely change
  });
};

export const useCreateThemePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createThemePreset,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRESETS_KEY] }),
  });
};

export const useUpdateThemePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateThemePreset,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRESETS_KEY] }),
  });
};

export const useDeleteThemePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteThemePreset,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRESETS_KEY] }),
  });
};

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
