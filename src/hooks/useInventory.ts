// src/hooks/useInventory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, adjustInventory } from "@/api/inventory";
import type {
  AdjustInventoryPayload,
  GetInventoryParams,
} from "@/api/inventory";

const INVENTORY_KEY = "inventory";

export const useGetInventory = (params: GetInventoryParams) =>
  useQuery({
    queryKey: [INVENTORY_KEY, params.store_id],
    queryFn: () => getInventory(params),
    enabled: !!params.store_id,
  });

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdjustInventoryPayload) => adjustInventory(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] }),
  });
};
