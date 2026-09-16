import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaymentSettings,
  createPaymentSettings,
  updatePaymentSettings,
  getOrderTypeSettings,
  updateOrderTypeSettings,
  resetOrderTypeSettings,
  type PaymentSettings,
  type PaymentFlags,
  type OrderTypeName,
} from "@/api/paymentSettings";

const PAYMENT_KEY = "payment-settings";
const ORDER_TYPE_KEY = "payment-settings-order-types";

export const useGetPaymentSettings = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [PAYMENT_KEY, store_id],
    queryFn: () => getPaymentSettings(store_id!),
    enabled: !!store_id,
    retry: false,
  });
};

export const useCreatePaymentSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentSettings) => createPaymentSettings(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_KEY, variables.store_id],
      });
    },
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PaymentSettings }) =>
      updatePaymentSettings(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_KEY, variables.payload.store_id],
      });
    },
  });
};

export const useGetOrderTypeSettings = (store_id: number | string | null) => {
  return useQuery({
    queryKey: [ORDER_TYPE_KEY, store_id],
    queryFn: () => getOrderTypeSettings(store_id!),
    enabled: !!store_id,
    retry: false,
  });
};

export const useUpdateOrderTypeSettings = (store_id: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      order_type,
      flags,
    }: {
      order_type: OrderTypeName;
      flags: Partial<PaymentFlags>;
    }) => updateOrderTypeSettings(store_id, order_type, flags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDER_TYPE_KEY, store_id] });
    },
  });
};

export const useResetOrderTypeSettings = (store_id: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order_type: OrderTypeName) =>
      resetOrderTypeSettings(store_id, order_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDER_TYPE_KEY, store_id] });
    },
  });
};
