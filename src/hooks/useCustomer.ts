import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getCustomers } from "@/api/customer";
import type { GetCustomersParams, CustomersResponse } from "@/api/customer";

export const CUSTOMER_KEY = "customers";

export const useGetCustomers = (params: GetCustomersParams) =>
  useQuery<CustomersResponse, Error>({
    queryKey: [CUSTOMER_KEY, params],
    queryFn: () => getCustomers(params),
    enabled: !!params.store_id,
    placeholderData: (prev) => prev,
  });

export const useInfiniteCustomers = (params: Omit<GetCustomersParams, "offset" | "limit"> & { limit?: number }) =>
  useInfiniteQuery<CustomersResponse, Error>({
    queryKey: [CUSTOMER_KEY, "infinite", params],
    queryFn: ({ pageParam = 0 }) => 
      getCustomers({ ...params, limit: params.limit || 20, offset: pageParam as number }),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const currentOffset = typeof lastPageParam === "number" ? lastPageParam : 0;
      const limit = params.limit || 20;
      const nextOffset = currentOffset + limit;
      return nextOffset < (lastPage.total || 0) ? nextOffset : undefined;
    },
    initialPageParam: 0,
    enabled: !!params.store_id,
  });
