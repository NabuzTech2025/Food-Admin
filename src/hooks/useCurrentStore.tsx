import { getCurrentStore } from "@/api/Currentstore";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const STORE_KEY = "store";

export const useCurrentStore = (store_id: number | string | null) => {
  const setStoreData = useAdminStore((s) => s.setStoreData);

  const query = useQuery({
    queryKey: [STORE_KEY, store_id],
    queryFn: () => getCurrentStore(store_id!),
    enabled: !!store_id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setStoreData(query.data);
  }, [query.data]);

  return query;
};
