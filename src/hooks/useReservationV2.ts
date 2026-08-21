import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  getReservationConfig,
  updateReservationConfig,
  getAvailability,
  getTodayReservations,
  getReceivedTodayReservations,
  filterReservations,
  updateReservation,
  createReservation,
  deleteReservation,
  getSuperAdminReceivedTodayV2,
} from "@/api/reservationV2";
import type {
  ReservationConfig,
  UpdateReservationPayload,
  FilterReservationsPayload,
  CreateReservationPayload,
} from "@/api/reservationV2";

const KEY = "reservation-v2";

// Resolve the store id for the reservation dashboard: a `:storeId` route param
// wins (super admin at /super/stores/:storeId/reservation-dashboard), then a
// `?store_id=` query param, otherwise the logged-in store owner's own store
// from the session. Returns null when none is usable.
export const useReservationStoreId = (): number | null => {
  const { storeId: pathStoreId } = useParams();
  const [params] = useSearchParams();
  const sessionStoreId = useAdminStore((s) => s.store_id);
  const raw = pathStoreId ?? params.get("store_id") ?? sessionStoreId;
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const useReservationConfig = (storeId: number | null) =>
  useQuery({
    queryKey: [KEY, "config", storeId],
    queryFn: () => getReservationConfig(storeId!),
    enabled: !!storeId,
  });

export const useUpdateReservationConfig = (storeId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Omit<ReservationConfig, "store_id">>) =>
      updateReservationConfig(storeId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "config", storeId] });
      toast.success("Reservation settings saved");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to save settings"),
  });
};

export const useAvailability = (
  storeId: number | null,
  date: string,
  partySize = 2,
) =>
  useQuery({
    queryKey: [KEY, "availability", storeId, date, partySize],
    queryFn: () => getAvailability(storeId!, date, partySize),
    enabled: !!storeId && !!date,
  });

export const useTodayReservations = (storeId: number | null) =>
  useQuery({
    queryKey: [KEY, "today", storeId],
    queryFn: () => getTodayReservations(storeId!),
    enabled: !!storeId,
  });

export const useReceivedTodayReservations = (storeId: number | null) =>
  useQuery({
    queryKey: [KEY, "received-today", storeId],
    queryFn: () => getReceivedTodayReservations(storeId!),
    enabled: !!storeId,
  });

export const useFilterReservations = (
  payload: FilterReservationsPayload | null,
) =>
  useQuery({
    queryKey: [KEY, "filter", payload],
    queryFn: () => filterReservations(payload!),
    enabled: !!payload?.store_id,
  });

// Accept / decline / extend / edit — invalidates today + filter lists.
export const useUpdateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateReservationPayload;
    }) => updateReservation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Update failed"),
  });
};

export const useCreateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservationPayload) =>
      createReservation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Reservation created");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to create reservation"),
  });
};

export const useSuperAdminReceivedTodayV2 = () =>
  useQuery({
    queryKey: [KEY, "super-admin", "received-today"],
    queryFn: getSuperAdminReceivedTodayV2,
  });

export const useDeleteReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReservation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Delete failed"),
  });
};
