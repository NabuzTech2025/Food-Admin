// src/hooks/useItemAllergy.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllergyProductLinks,
  addAllergyToProduct,
  removeAllergyFromProduct,
} from "@/api/itemAllergy";

const ITEM_ALLERGY_KEY = "item-allergies";

export const useGetAllergyProductLinks = (store_id: number | string | null) =>
  useQuery({
    queryKey: [ITEM_ALLERGY_KEY, store_id],
    queryFn: () => getAllergyProductLinks(store_id!),
    enabled: !!store_id,
  });

export const useAddAllergyToProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      product_id,
      allergy_id,
    }: {
      product_id: number;
      allergy_id: number;
    }) => addAllergyToProduct(product_id, allergy_id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ITEM_ALLERGY_KEY] }),
  });
};

export const useRemoveAllergyFromProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      product_id,
      allergy_id,
    }: {
      product_id: number;
      allergy_id: number;
    }) => removeAllergyFromProduct(product_id, allergy_id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ITEM_ALLERGY_KEY] }),
  });
};
