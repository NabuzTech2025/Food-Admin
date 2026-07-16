import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreMetadata,
  createStoreMetadata,
  updateStoreMetadata,
  deleteStoreMetadata,
  type StoreMetadataCreatePayload,
  type StoreMetadataPayload,
} from "@/api/storeMetadata";

const STORE_METADATA_KEY = "storeMetadata";

export const useGetStoreMetadata = (storeId?: number | string) => {
  return useQuery({
    queryKey: [STORE_METADATA_KEY, storeId],
    queryFn: () => getStoreMetadata(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStoreMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreMetadataCreatePayload) =>
      createStoreMetadata(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_METADATA_KEY] });
    },
  });
};

export const useUpdateStoreMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: number | string;
      payload: StoreMetadataPayload;
    }) => updateStoreMetadata(storeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_METADATA_KEY] });
    },
  });
};

export const useDeleteStoreMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: number | string) => deleteStoreMetadata(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_METADATA_KEY] });
    },
  });
};
