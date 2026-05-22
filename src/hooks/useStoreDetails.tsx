import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getStores,
  updateStore,
  type Store,
  type StoreUpdatePayload,
} from "@/api/storedetails";

const STORE_KEY = "stores";

// ================= QUERIES =================

export const useGetStores = (store_id?: number | string | null) => {
  return useQuery<Store[]>({
    queryKey: store_id ? [STORE_KEY, store_id] : [STORE_KEY],

    queryFn: () => getStores(store_id),

    staleTime: 5 * 60 * 1000,
  });
};

// ================= MUTATION =================

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
      queryClient.invalidateQueries({
        queryKey: [STORE_KEY],
      });
    },
  });
};
