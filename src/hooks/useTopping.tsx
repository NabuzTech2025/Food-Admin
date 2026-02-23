// src/hooks/useTopping.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTopping,
  addTopping,
  updateTopping,
  deleteTopping,
  reactivateTopping,
} from "@/api/topping";
import type { ToppingPayload } from "@/api/topping";

const TOPPING_KEY = "toppings";

export const useGetTopping = (store_id: number | string | null) =>
  useQuery({
    queryKey: [TOPPING_KEY, store_id],
    queryFn: () => getTopping(store_id!),
    enabled: !!store_id,
  });

export const useAddTopping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ToppingPayload) => addTopping(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TOPPING_KEY] }),
  });
};

export const useUpdateTopping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ToppingPayload }) =>
      updateTopping(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TOPPING_KEY] }),
  });
};

export const useDeleteTopping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTopping(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TOPPING_KEY] }),
  });
};

export const useReactivateTopping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reactivateTopping(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TOPPING_KEY] }),
  });
};
