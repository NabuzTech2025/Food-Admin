import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listBlockedDates,
  createBlockedDate,
  updateBlockedDate,
  deleteBlockedDate,
} from "@/api/blockedDates";
import type {
  CreateBlockedDatePayload,
  UpdateBlockedDatePayload,
} from "@/api/blockedDates";

const KEY = "blocked-dates";

export const useBlockedDates = (storeId: number | null) =>
  useQuery({
    queryKey: [KEY, storeId],
    queryFn: () => listBlockedDates(storeId!, { includeInactive: true }),
    enabled: !!storeId,
  });

export const useCreateBlockedDate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBlockedDatePayload) =>
      createBlockedDate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Blocked date created");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message || "Failed to create blocked date",
      ),
  });
};

export const useUpdateBlockedDate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateBlockedDatePayload;
    }) => updateBlockedDate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Blocked date updated");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message || "Failed to update blocked date",
      ),
  });
};

export const useDeleteBlockedDate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBlockedDate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Blocked date deleted");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message || "Failed to delete blocked date",
      ),
  });
};
