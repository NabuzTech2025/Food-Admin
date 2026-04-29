import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/api/order";
import type { OrderFilterParams } from "@/api/order";

const ORDER_KEY = "orders";

export const useGetOrders = (params: OrderFilterParams) => {
  return useQuery({
    queryKey: [ORDER_KEY, params.store_id, params.target_date],
    queryFn: () => getOrders(params),
    enabled: !!params.store_id && !!params.target_date,
  });
};
