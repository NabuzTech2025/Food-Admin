import axiosInstance from "@/api/axiosConfig";

export type Placement = "popup" | "banner" | "menu_card";
export type CtaType = "none" | "url" | "category" | "product" | "coupon";
export type Frequency =
  | "always"
  | "once_per_session"
  | "once_per_day"
  | "once_ever";

export interface Announcement {
  id: number;
  store_id: number | null;
  placement: Placement;
  title: string;
  body: string | null;
  title_en: string | null;
  body_en: string | null;
  image_url: string | null;
  cta_type: CtaType;
  cta_value: string | null;
  cta_label: string | null;
  cta_label_en: string | null;
  display_order: number;
  is_active: boolean;
  dismissible: boolean;
  frequency: Frequency;
  start_at: string | null;
  end_at: string | null;
  days_of_week: number[] | null;
  daily_start_time: string | null;
  daily_end_time: string | null;
  created_at: string;
  updated_at: string;
}

// Create needs `title`; everything else is optional (backend has defaults).
export interface AnnouncementPayload {
  title: string;
  store_id?: number | null;
  placement?: Placement;
  body?: string | null;
  title_en?: string | null;
  body_en?: string | null;
  image_url?: string | null;
  cta_type?: CtaType;
  cta_value?: string | null;
  cta_label?: string | null;
  cta_label_en?: string | null;
  display_order?: number;
  is_active?: boolean;
  dismissible?: boolean;
  frequency?: Frequency;
  start_at?: string | null;
  end_at?: string | null;
  days_of_week?: number[] | null;
  daily_start_time?: string | null;
  daily_end_time?: string | null;
}

const BASE = "store-announcements";

// Step 1 — list ALL announcements of the store (inactive/future/expired too).
export const getAnnouncements = async (
  store_id?: number | string | null,
  placement?: Placement,
): Promise<Announcement[]> => {
  const res = await axiosInstance.get(`${BASE}/`, {
    params: {
      ...(store_id != null ? { store_id } : {}),
      ...(placement ? { placement } : {}),
    },
  });
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

// Step 3 — create.
export const createAnnouncement = async (
  payload: AnnouncementPayload,
): Promise<Announcement> => {
  const res = await axiosInstance.post(`${BASE}/`, payload);
  return res.data;
};

// Step 4 — partial update. store_id cannot change.
export const updateAnnouncement = async (
  id: number,
  payload: Partial<AnnouncementPayload>,
): Promise<Announcement> => {
  const res = await axiosInstance.put(`${BASE}/${id}`, payload);
  return res.data;
};

// Step 5 — reorder (send all new positions at once).
export const reorderAnnouncements = async (payload: {
  store_id?: number | null;
  items: { id: number; display_order: number }[];
}): Promise<Announcement[]> => {
  const res = await axiosInstance.patch(`${BASE}/reorder`, payload);
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

// Step 6 — delete (permanent).
export const deleteAnnouncement = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${BASE}/${id}`);
};
