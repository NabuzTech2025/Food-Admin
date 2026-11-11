import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  reorderAnnouncements,
  updateAnnouncement,
  type AnnouncementPayload,
  type Placement,
} from "@/api/storeAnnouncement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "store-announcements";

export const useGetAnnouncements = (
  store_id: number | string | null,
  placement?: Placement,
) =>
  useQuery({
    queryKey: [KEY, store_id, placement ?? null],
    queryFn: () => getAnnouncements(store_id, placement),
    enabled: !!store_id,
  });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnnouncementPayload) => createAnnouncement(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<AnnouncementPayload>;
    }) => updateAnnouncement(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useReorderAnnouncements = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      store_id?: number | null;
      items: { id: number; display_order: number }[];
    }) => reorderAnnouncements(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
