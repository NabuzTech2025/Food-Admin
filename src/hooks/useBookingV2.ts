import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  getTodayBookings,
  filterBookings,
  getBookingById,
  updateBooking,
  listServices,
  createService,
  updateService,
  deleteService,
  getServiceAvailability,
  createGuestBooking,
  getBookingConfig,
  updateBookingConfig,
} from "@/api/bookingV2";
import type {
  FilterBookingsPayload,
  UpdateBookingPayload,
  CreateServicePayload,
  UpdateServicePayload,
  CreateGuestBookingPayload,
  BookingConfig,
} from "@/api/bookingV2";

const KEY = "booking-v2";

// Resolve the store id: `:storeId` route param wins, then `?store_id=`, then
// the logged-in owner's own store. Returns null when none is usable.
export const useBookingStoreId = (): number | null => {
  const { storeId: pathStoreId } = useParams();
  const [params] = useSearchParams();
  const sessionStoreId = useAdminStore((s) => s.store_id);
  const raw = pathStoreId ?? params.get("store_id") ?? sessionStoreId;
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const useTodayBookings = (storeId: number | null) =>
  useQuery({
    queryKey: [KEY, "today", storeId],
    queryFn: () => getTodayBookings(storeId!),
    enabled: !!storeId,
  });

export const useFilterBookings = (
  storeId: number | null,
  targetDate: string,
  opts?: { limit?: number; offset?: number },
) =>
  useQuery({
    queryKey: [KEY, "filter", storeId, targetDate, opts?.limit, opts?.offset],
    queryFn: () =>
      filterBookings({
        store_id: storeId!,
        target_date: targetDate,
        limit: opts?.limit ?? 100,
        offset: opts?.offset ?? 0,
      } as FilterBookingsPayload),
    enabled: !!storeId && !!targetDate,
  });

export const useBookingById = (id: number | null) =>
  useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => getBookingById(id!),
    enabled: !!id,
  });

// Confirm ({status:"booked"}), cancel ({status:"cancelled"}), and move/edit
// all route through PUT /bookings/v2/{id}.
export const useUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBookingPayload }) =>
      updateBooking(id, payload),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      const verb =
        booking.status === "booked"
          ? "confirmed"
          : booking.status === "cancelled"
            ? "cancelled"
            : "updated";
      toast.success(`Booking ${verb}`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to update booking"),
  });
};

// ── Services ────────────────────────────────────────────────────
const SVC = "booking-service";

export const useServices = (storeId: number | null, includeInactive = false) =>
  useQuery({
    queryKey: [SVC, storeId, includeInactive],
    queryFn: () => listServices(storeId!, includeInactive),
    enabled: !!storeId,
  });

export const useCreateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServicePayload) => createService(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SVC] });
      toast.success("Service created");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to create service"),
  });
};

export const useUpdateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateServicePayload }) =>
      updateService(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SVC] });
      toast.success("Service updated");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to update service"),
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SVC] });
      toast.success("Service deleted");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to delete service"),
  });
};

// ── Availability & guest booking ───────────────────────────────
export const useServiceAvailability = (
  serviceId: number | null,
  date: string,
  partySize: number,
) =>
  useQuery({
    queryKey: [KEY, "availability", serviceId, date, partySize],
    queryFn: () => getServiceAvailability(serviceId!, date, partySize),
    enabled: !!serviceId && !!date && partySize > 0,
  });

export const useCreateGuestBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGuestBookingPayload) => createGuestBooking(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Booking created");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to create booking"),
  });
};

// ── Config (settings) ──────────────────────────────────────────
const CFG = "booking-config";

export const useBookingConfig = (storeId: number | null) =>
  useQuery({
    queryKey: [CFG, storeId],
    queryFn: () => getBookingConfig(storeId!),
    enabled: !!storeId,
  });

export const useUpdateBookingConfig = (storeId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Omit<BookingConfig, "store_id">>) =>
      updateBookingConfig(storeId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CFG, storeId] });
      toast.success("Settings saved");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to save settings"),
  });
};
