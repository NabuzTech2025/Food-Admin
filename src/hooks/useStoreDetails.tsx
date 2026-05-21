import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStores, updateStore } from "@/api/storedetails";
import type { StoreUpdatePayload } from "@/api/storedetails";

const STORE_KEY = "stores";

export const useGetStores = (store_id?: number | string | null) => {
  return useQuery({
    queryKey: store_id ? [STORE_KEY, store_id] : [STORE_KEY],
    queryFn: () => getStores(store_id),
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
      payload: StoreUpdatePayload;
    }) => updateStore(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_KEY] });
    },
  });
};
