// src/hooks/useAllergy.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllergy,
  addAllergy,
  updateAllergy,
  deleteAllergy,
} from "@/api/allergy";
import type { AllergyPayload } from "@/api/allergy";

const ALLERGY_KEY = "allergies";

export const useGetAllergy = (store_id: number | string | null) =>
  useQuery({
    queryKey: [ALLERGY_KEY, store_id],
    queryFn: () => getAllergy(store_id!),
    enabled: !!store_id,
  });

export const useAddAllergy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AllergyPayload) => addAllergy(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ALLERGY_KEY] }),
  });
};

export const useUpdateAllergy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AllergyPayload }) =>
      updateAllergy(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ALLERGY_KEY] }),
  });
};

export const useDeleteAllergy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAllergy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ALLERGY_KEY] }),
  });
};
