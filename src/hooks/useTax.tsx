// src/hooks/Admin/useTax.ts
import {
  addTax,
  deleteTax,
  getTax,
  updateTax,
  type TaxPayload,
} from "@/api/tax";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TAX_KEY = "taxes";

export const useGetTax = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [TAX_KEY, store_id],
    queryFn: () => getTax(store_id!),
    enabled: !!store_id,
  });
};

export const useAddTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaxPayload) => addTax(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAX_KEY] });
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxPayload }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAX_KEY] });
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAX_KEY] });
    },
  });
};
