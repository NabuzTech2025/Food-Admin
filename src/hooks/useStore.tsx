import { getStoreById, type StoreDetail } from "@/api/store";
import { useQuery } from "@tanstack/react-query";

const STORE_BY_ID_KEY = "store-by-id";

export const useGetStore = (storeId?: number | string | null) => {
  return useQuery<StoreDetail>({
    queryKey: [STORE_BY_ID_KEY, storeId],
    queryFn: () => getStoreById(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};
