// src/hooks/useDiscount.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDiscounts, addDiscount, updateDiscount } from "@/api/discount";
import type { DiscountPayload } from "@/api/discount";

const DISCOUNT_KEY = "discounts";

export const useGetDiscounts = (store_id: number | string | null) =>
  useQuery({
    queryKey: [DISCOUNT_KEY, store_id],
    queryFn: () => getDiscounts(store_id!),
    enabled: !!store_id,
  });

export const useAddDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DiscountPayload) => addDiscount(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_KEY] }),
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DiscountPayload }) =>
      updateDiscount(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_KEY] }),
  });
};
