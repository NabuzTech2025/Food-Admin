// src/hooks/useProductGroup.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductGroup,
  addProductGroup,
  updateProductGroup,
  deleteProductGroup,
  addProductVariantGroup,
  updateProductVariantGroup,
  deleteProductVariantGroup,
} from "@/api/productGroup";
import type { ProductGroupPayload } from "@/api/productGroup";

const PRODUCT_GROUP_KEY = "product-groups";

// ─── Product Group Hooks ──────────────────────────────────────────────────────

export const useGetProductGroup = (store_id: number | string | null) =>
  useQuery({
    queryKey: [PRODUCT_GROUP_KEY, store_id],
    queryFn: () => getProductGroup(store_id!),
    enabled: !!store_id,
  });

export const useAddProductGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductGroupPayload) => addProductGroup(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRODUCT_GROUP_KEY] }),
  });
};

export const useUpdateProductGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ProductGroupPayload;
    }) => updateProductGroup(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRODUCT_GROUP_KEY] }),
  });
};

export const useDeleteProductGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductGroup(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRODUCT_GROUP_KEY] }),
  });
};

// ───         Variant Group Hooks ──────────────────────────────────────────────────────

export const useAddProductVariantGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductGroupPayload) =>
      addProductVariantGroup(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRODUCT_GROUP_KEY] }),
  });
};

export const useUpdateProductVariantGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ProductGroupPayload;
    }) => updateProductVariantGroup(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRODUCT_GROUP_KEY] }),
  });
};

export const useDeleteProductVariantGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductVariantGroup(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PRODUCT_GROUP_KEY] }),
  });
};
