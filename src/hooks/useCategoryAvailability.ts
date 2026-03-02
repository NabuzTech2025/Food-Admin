// src/hooks/useCategoryAvailability.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategoryAvailabilities,
  createBulkCategoryAvailabilities,
  deleteCategoryAvailability,
} from "@/api/categoryAvailability";
import type { CategoryAvailabilityPayload } from "@/api/categoryAvailability";

const CA_KEY = "category-availabilities";

export const useGetCategoryAvailabilities = () =>
  useQuery({
    queryKey: [CA_KEY],
    queryFn: getCategoryAvailabilities,
  });

export const useCreateBulkCategoryAvailabilities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryAvailabilityPayload[]) =>
      createBulkCategoryAvailabilities(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CA_KEY] }),
  });
};

export const useDeleteCategoryAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoryAvailability(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CA_KEY] }),
  });
};
