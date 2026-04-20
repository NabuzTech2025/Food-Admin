import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  type CouponPayload,
} from "@/api/coupon";

export const useGetCoupons = (store_id: number | string | null) => {
  return useQuery({
    queryKey: ["coupons", store_id],
    queryFn: () => getCoupons(store_id!),
    enabled: !!store_id,
  });
};

export const useAddCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponPayload) => addCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CouponPayload }) =>
      updateCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      toggleCouponStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};
