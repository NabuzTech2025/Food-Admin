import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreLegalPagesManage,
  createStoreLegalPage,
  updateStoreLegalPage,
  deleteStoreLegalPage,
  type StoreLegalPageCreatePayload,
  type StoreLegalPageUpdatePayload,
} from "@/api/storeLegalPages";

const STORE_LEGAL_PAGES_KEY = "storeLegalPages";

export const useGetStoreLegalPages = (storeId?: number | string) => {
  return useQuery({
    queryKey: [STORE_LEGAL_PAGES_KEY, storeId],
    queryFn: () => getStoreLegalPagesManage(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStoreLegalPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreLegalPageCreatePayload) =>
      createStoreLegalPage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_LEGAL_PAGES_KEY] });
    },
  });
};

export const useUpdateStoreLegalPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      payload,
    }: {
      pageId: number;
      payload: StoreLegalPageUpdatePayload;
    }) => updateStoreLegalPage(pageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_LEGAL_PAGES_KEY] });
    },
  });
};

export const useDeleteStoreLegalPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => deleteStoreLegalPage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STORE_LEGAL_PAGES_KEY] });
    },
  });
};
