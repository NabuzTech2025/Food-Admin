import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreConfigs,
  createStoreConfig,
  updateStoreConfig,
  type StoreConfigCreatePayload,
  type StoreConfigUpdatePayload,
} from "@/api/storeConfig";

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

export const useCreateStoreConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreConfigCreatePayload) =>
      createStoreConfig(payload),
    onSuccess: () => {
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
