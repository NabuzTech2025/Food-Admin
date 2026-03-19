// src/hooks/useDeliveryZone.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDeliveryZones,
  addDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "@/api/deliveryZone";
import type { DeliveryZonePayload } from "@/api/deliveryZone";

const ZONE_KEY = "delivery-zones";

export const useGetDeliveryZones = (store_id: number | string | null) =>
  useQuery({
    queryKey: [ZONE_KEY, store_id],
    queryFn: () => getDeliveryZones(store_id!),
    enabled: !!store_id,
  });

export const useAddDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeliveryZonePayload) => addDeliveryZone(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ZONE_KEY] }),
  });
};

export const useUpdateDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: DeliveryZonePayload;
    }) => updateDeliveryZone(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ZONE_KEY] }),
  });
};

export const useDeleteDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDeliveryZone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ZONE_KEY] }),
  });
};
