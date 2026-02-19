// src/hooks/Admin/useCategory.ts — add mutations
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategory, addCategory, updateCategory } from "@/api/category";
import type { CategoryPayload } from "@/api/category";

const CATEGORY_KEY = "categories";

export const useGetCategory = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [CATEGORY_KEY, store_id],
    queryFn: () => getCategory(store_id!),
    enabled: !!store_id,
    select: (data) =>
      [...data].sort(
        (a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999),
      ),
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => addCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_KEY] });
    },
  });
};

// src/hooks/useCategory.ts — add useUpdateCategory
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_KEY] });
    },
  });
};
