import {
  getStoreById,
  getStoreActive,
  getAllStoresActive,
  setStoreActive,
  updateStore,
  type StoreDetail,
} from "@/api/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STORE_BY_ID_KEY = "store-by-id";
const STORE_ACTIVE_KEY = "store-active";
const STORES_ACTIVE_KEY = "stores-active";

export const useGetStore = (storeId?: number | string | null) => {
  return useQuery<StoreDetail>({
    queryKey: [STORE_BY_ID_KEY, storeId],
    queryFn: () => getStoreById(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Partial<StoreDetail>;
    }) => updateStore(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STORE_BY_ID_KEY, variables.id],
      });
    },
  });
};

export const useGetAllStoresActive = (isActive?: boolean) => {
  return useQuery({
    queryKey: [STORES_ACTIVE_KEY, isActive ?? "all"],
    queryFn: () => getAllStoresActive(isActive),
  });
};

export const useGetStoreActive = (storeId?: number | string | null) => {
  return useQuery({
    queryKey: [STORE_ACTIVE_KEY, storeId],
    queryFn: () => getStoreActive(storeId!),
    enabled: !!storeId,
  });
};

export const useSetStoreActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: number | string;
      isActive: boolean;
    }) => setStoreActive(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [STORE_ACTIVE_KEY, variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: [STORE_BY_ID_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: [STORES_ACTIVE_KEY] });
    },
  });
};
