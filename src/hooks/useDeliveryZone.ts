// src/hooks/useDeliveryZone.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDeliveryZones,
  addDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  type DeliveryZonePayload,
} from "@/api/deliveryZones";

const DELIVERY_ZONE_KEY = "delivery-zones";

export const useGetDeliveryZones = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [DELIVERY_ZONE_KEY, store_id],
    queryFn: () => getDeliveryZones(store_id!),
    enabled: !!store_id,
  });
};

export const useAddDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeliveryZonePayload) => addDeliveryZone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELIVERY_ZONE_KEY] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELIVERY_ZONE_KEY] });
    },
  });
};

export const useDeleteDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDeliveryZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELIVERY_ZONE_KEY] });
    },
  });
};
