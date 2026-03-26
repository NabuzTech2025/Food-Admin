// src/hooks/useDeliveryTimePlan.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDeliveryTimePlans,
  bulkCreateDeliveryTimePlans,
  updateDeliveryTimePlan,
  deleteDeliveryTimePlan,
} from "@/api/deliveryTimePlan";
import type { DeliveryTimePlanPayload } from "@/api/deliveryTimePlan";

const PLAN_KEY = "delivery-time-plans";

export const useGetDeliveryTimePlans = (store_id: number | string | null) =>
  useQuery({
    queryKey: [PLAN_KEY, store_id],
    queryFn: () => getDeliveryTimePlans(store_id!),
    enabled: !!store_id,
  });

export const useBulkCreateDeliveryTimePlans = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      store_id,
      payload,
    }: {
      store_id: number | string;
      payload: DeliveryTimePlanPayload[];
    }) => bulkCreateDeliveryTimePlans(store_id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PLAN_KEY] }),
  });
};

export const useUpdateDeliveryTimePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: DeliveryTimePlanPayload;
    }) => updateDeliveryTimePlan(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PLAN_KEY] }),
  });
};

export const useDeleteDeliveryTimePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDeliveryTimePlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PLAN_KEY] }),
  });
};
