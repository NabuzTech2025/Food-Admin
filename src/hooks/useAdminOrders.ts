import { useQuery } from "@tanstack/react-query";

import {
  getAdminOrders,
  type AdminOrder,
  type AdminOrdersParams,
} from "@/api/order";

const ADMIN_ORDERS_KEY = "admin-orders";

export const useGetAdminOrders = (params: AdminOrdersParams) => {
  return useQuery<AdminOrder[]>({
    queryKey: [ADMIN_ORDERS_KEY, params],

    queryFn: () => getAdminOrders(params),

    staleTime: 5 * 60 * 1000,
  });
};
