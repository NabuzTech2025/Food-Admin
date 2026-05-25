import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaymentSettings,
  createPaymentSettings,
  updatePaymentSettings,
  type PaymentSettings,
} from "@/api/paymentSettings";

const PAYMENT_KEY = "payment-settings";

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
