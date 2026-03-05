// src/hooks/useStoreSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreHours,
  addStoreHour,
  deleteStoreHour,
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/api/storeSettings";
import type { StoreHourPayload, HolidayPayload } from "@/api/storeSettings";

const STORE_HOURS_KEY = "store-hours";
const HOLIDAYS_KEY = "holidays";

// ─── Store Hours ──────────────────────────────────────────────────────────────

export const useGetStoreHours = (store_id: number | string | null) =>
  useQuery({
    queryKey: [STORE_HOURS_KEY, store_id],
    queryFn: () => getStoreHours(store_id!),
    enabled: !!store_id,
  });

export const useAddStoreHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      store_id,
      payload,
    }: {
      store_id: number | string;
      payload: StoreHourPayload;
    }) => addStoreHour(store_id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [STORE_HOURS_KEY] }),
  });
};

export const useDeleteStoreHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStoreHour(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [STORE_HOURS_KEY] }),
  });
};

// ─── Holidays ─────────────────────────────────────────────────────────────────

export const useGetHolidays = (store_id: number | string | null) =>
  useQuery({
    queryKey: [HOLIDAYS_KEY, store_id],
    queryFn: () => getHolidays(store_id!),
    enabled: !!store_id,
  });

export const useAddHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HolidayPayload) => addHoliday(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [HOLIDAYS_KEY] }),
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HolidayPayload }) =>
      updateHoliday(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [HOLIDAYS_KEY] }),
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteHoliday(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [HOLIDAYS_KEY] }),
  });
};
