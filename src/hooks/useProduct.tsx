import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/api/product";
import type { ProductPayload } from "@/api/product";

const PRODUCT_KEY = "products";

export const useGetProduct = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [PRODUCT_KEY, store_id],
    queryFn: () => getProduct(store_id!),
    enabled: !!store_id,
    select: (data) =>
      [...data].sort(
        (a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999),
      ),
  });
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => addProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] });
    },
  });
};
