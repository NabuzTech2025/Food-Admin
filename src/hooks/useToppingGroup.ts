// src/hooks/useToppingGroup.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getToppingGroup,
  addToppingGroup,
  updateToppingGroup,
  deleteToppingGroup,
  reactivateToppingGroup,
  type ToppingGroupPayload,
} from "@/api/toppingsGroup";

const TOPPING_GROUP_KEY = "topping-groups";

export const useGetToppingGroup = (store_id: number | string | null) =>
  useQuery({
    queryKey: [TOPPING_GROUP_KEY, store_id],
    queryFn: () => getToppingGroup(store_id!),
    enabled: !!store_id,
  });

export const useAddToppingGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ToppingGroupPayload) => addToppingGroup(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TOPPING_GROUP_KEY] }),
  });
};

export const useUpdateToppingGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ToppingGroupPayload;
    }) => updateToppingGroup(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TOPPING_GROUP_KEY] }),
  });
};

export const useDeleteToppingGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteToppingGroup(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TOPPING_GROUP_KEY] }),
  });
};

export const useReactivateToppingGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reactivateToppingGroup(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TOPPING_GROUP_KEY] }),
  });
};
