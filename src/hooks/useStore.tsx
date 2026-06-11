import { getStoreById, updateStore, type StoreDetail } from "@/api/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STORE_BY_ID_KEY = "store-by-id";

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
