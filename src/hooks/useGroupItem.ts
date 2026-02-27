// src/hooks/useGroupItem.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroupItem,
  addGroupItem,
  updateGroupItem,
  deleteGroupItem,
} from "@/api/groupItem";
import type { GroupItemPayload } from "@/api/groupItem";

const GROUP_ITEM_KEY = "group-items";

export const useGetGroupItem = (store_id: number | string | null) =>
  useQuery({
    queryKey: [GROUP_ITEM_KEY, store_id],
    queryFn: () => getGroupItem(store_id!),
    enabled: !!store_id,
  });

export const useAddGroupItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupItemPayload) => addGroupItem(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [GROUP_ITEM_KEY] }),
  });
};

export const useUpdateGroupItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GroupItemPayload }) =>
      updateGroupItem(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [GROUP_ITEM_KEY] }),
  });
};

export const useDeleteGroupItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGroupItem(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [GROUP_ITEM_KEY] }),
  });
};
