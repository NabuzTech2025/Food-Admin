import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getStoreConfigs,
  createStoreConfig,
  updateStoreConfig,
  deleteStoreConfig,
  type StoreConfigCreatePayload,
  type StoreConfigUpdatePayload,
} from "@/api/storeConfig";
import { addBasicStoreSettings } from "@/api/storeSettings";

const STORE_CONFIG_KEY = "storeConfigs";

export const useGetStoreConfigs = (params: {
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [STORE_CONFIG_KEY, params],
    queryFn: () => getStoreConfigs(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetStoreConfigsInfinite = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: [STORE_CONFIG_KEY, "infinite", limit],
    queryFn: ({ pageParam = 0 }) =>
      getStoreConfigs({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === limit ? lastPageParam + limit : undefined,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStoreConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreConfigCreatePayload) =>
      createStoreConfig(payload),
    onSuccess: (_, payload) => {
      addBasicStoreSettings({
        store_id: payload.store_id,
        auto_accept_orders_remote: true,
        auto_print_orders_remote: false,
        auto_accept_orders_local: false,
        auto_print_orders_local: true,
        auto_accept_reservations: true,
      });
      queryClient.invalidateQueries({ queryKey: [STORE_CONFIG_KEY] });
    },
  });
};

export const useUpdateStoreConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      domain,
      payload,
    }: {
      domain: string;
      payload: StoreConfigUpdatePayload;
    }) => updateStoreConfig(domain, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_CONFIG_KEY] });
    },
  });
};

export const useDeleteStoreConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => deleteStoreConfig(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_CONFIG_KEY] });
    },
  });
};
