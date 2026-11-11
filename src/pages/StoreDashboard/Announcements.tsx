import { useMemo, useState } from "react";
import {
  AppWindow,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  CircleX,
  GalleryThumbnails,
  Layers,
  Loader2,
  Megaphone,
  PanelTop,
  Pencil,
  Plus,
  Power,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import SearchableSelect from "@/components/SearchableSelect";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useUploadImage } from "@/hooks/Common/useUploadImage";
import { useGetCategory } from "@/hooks/useCategory";
import { useGetProduct } from "@/hooks/useProduct";
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useGetAnnouncements,
  useReorderAnnouncements,
  useUpdateAnnouncement,
} from "@/hooks/useStoreAnnouncement";
import type {
  Announcement,
  AnnouncementPayload,
  CtaType,
  Frequency,
  Placement,
} from "@/api/storeAnnouncement";

const PLACEMENT_META: Record<
  Placement,
  { icon: typeof AppWindow; label: string; desc: string }
> = {
  popup: {
    icon: AppWindow,
    label: "Popup",
    desc: "Show as a modal when site opens",
  },
  banner: { icon: PanelTop, label: "Banner", desc: "Top bar on all pages" },
  menu_card: {
    icon: GalleryThumbnails,
    label: "Menu Card",
    desc: "Card inside the menu list",
  },
};
const CTA_TYPES: CtaType[] = ["none", "url", "category", "product", "coupon"];
const FREQUENCIES: Frequency[] = [
  "always",
  "once_per_session",
  "once_per_day",
  "once_ever",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // 0..6

interface FormState {
  placement: Placement;
  title: string;
  title_en: string;
  body: string;
  body_en: string;
  image_url: string;
  cta_type: CtaType;
  cta_value: string;
  cta_label: string;
  cta_label_en: string;
  frequency: Frequency;
  dismissible: boolean;
  is_active: boolean;
  start_at: string; // "YYYY-MM-DD"
  end_at: string;
  days_of_week: number[];
  daily_start_time: string; // "HH:MM"
  daily_end_time: string;
}

const emptyForm: FormState = {
  placement: "popup",
  title: "",
  title_en: "",
  body: "",
  body_en: "",
  image_url: "",
  cta_type: "none",
  cta_value: "",
  cta_label: "",
  cta_label_en: "",
  frequency: "once_per_session",
  dismissible: true,
  is_active: true,
  start_at: "",
  end_at: "",
  days_of_week: [],
  daily_start_time: "",
  daily_end_time: "",
};

const toForm = (a: Announcement): FormState => ({
  placement: a.placement,
  title: a.title ?? "",
  title_en: a.title_en ?? "",
  body: a.body ?? "",
  body_en: a.body_en ?? "",
  image_url: a.image_url ?? "",
  cta_type: a.cta_type,
  cta_value: a.cta_value ?? "",
  cta_label: a.cta_label ?? "",
  cta_label_en: a.cta_label_en ?? "",
  frequency: a.frequency,
  dismissible: a.dismissible,
  is_active: a.is_active,
  start_at: a.start_at ? a.start_at.slice(0, 10) : "",
  end_at: a.end_at ? a.end_at.slice(0, 10) : "",
  days_of_week: a.days_of_week ?? [],
  daily_start_time: a.daily_start_time ? a.daily_start_time.slice(0, 5) : "",
  daily_end_time: a.daily_end_time ? a.daily_end_time.slice(0, 5) : "",
});

const trimOrNull = (v: string) => (v.trim() ? v.trim() : null);
const dateToIso = (v: string) => (v ? `${v}T00:00:00` : null);
const freqLabel = (f: Frequency) =>
  f.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

function statusOf(a: Announcement): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (!a.is_active) return { label: "Inactive", variant: "secondary" };
  const now = Date.now();
  if (a.start_at && new Date(a.start_at).getTime() > now)
    return { label: "Scheduled", variant: "outline" };
  if (a.end_at && new Date(a.end_at).getTime() < now)
    return { label: "Expired", variant: "destructive" };
  return { label: "Live", variant: "default" };
}

function Announcements() {
  const { store_id } = useAdminStore();
  const { data: list, isLoading } = useGetAnnouncements(store_id);
  const { data: categories } = useGetCategory(store_id);
  const { data: products } = useGetProduct(store_id);

  const { mutateAsync: createAnn, isPending: isCreating } =
    useCreateAnnouncement();
  const { mutateAsync: updateAnn, isPending: isUpdating } =
    useUpdateAnnouncement();
  const { mutateAsync: deleteAnn, isPending: isDeleting } =
    useDeleteAnnouncement();
  const { mutateAsync: reorder, isPending: isReordering } =
    useReorderAnnouncements();
  const { mutateAsync: upload, isPending: isUploading } = useUploadImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<Announcement | null>(null);
  const [lang, setLang] = useState<"de" | "en">("de");

  const rows = useMemo(
    () => [...(list ?? [])].sort((a, b) => a.display_order - b.display_order),
    [list],
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setLang("de");
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm(toForm(a));
    setLang("de");
    setDialogOpen(true);
  };

  const handleImage = async (file?: File) => {
    if (!file) return;
    const res = await upload({ file });
    set("image_url", res.url || res.image_url || "");
  };

  const buildPayload = (): AnnouncementPayload | null => {
    if (!form.title.trim()) {
      toast.error("German title is required");
      return null;
    }
    if (form.cta_type !== "none" && !form.cta_value.trim()) {
      toast.error("Button value is required for this button type");
      return null;
    }
    if (!!form.daily_start_time !== !!form.daily_end_time) {
      toast.error("Set both daily start and end time, or neither");
      return null;
    }
    return {
      placement: form.placement,
      title: form.title.trim(),
      title_en: trimOrNull(form.title_en),
      body: trimOrNull(form.body),
      body_en: trimOrNull(form.body_en),
      image_url: trimOrNull(form.image_url),
      cta_type: form.cta_type,
      cta_value: form.cta_type === "none" ? null : form.cta_value.trim(),
      cta_label: trimOrNull(form.cta_label),
      cta_label_en: trimOrNull(form.cta_label_en),
      frequency: form.frequency,
      dismissible: form.dismissible,
      is_active: form.is_active,
      start_at: dateToIso(form.start_at),
      end_at: dateToIso(form.end_at),
      days_of_week: form.days_of_week.length ? form.days_of_week : null,
      daily_start_time: form.daily_start_time || null,
      daily_end_time: form.daily_end_time || null,
    };
  };

  const onSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;
    try {
      if (editing) {
        await updateAnn({ id: editing.id, payload });
        toast.success("Announcement updated");
      } else {
        await createAnn({
          ...payload,
          store_id: store_id ? Number(store_id) : undefined,
          display_order: rows.length,
        });
        toast.success("Announcement created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(fieldError(err) || "Failed to save announcement");
    }
  };

  const toggleActive = async (a: Announcement) => {
    try {
      await updateAnn({ id: a.id, payload: { is_active: !a.is_active } });
    } catch (err: any) {
      toast.error(fieldError(err) || "Failed to update");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const ordered = [...rows];
    [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
    try {
      await reorder({
        store_id: store_id ? Number(store_id) : null,
        items: ordered.map((a, i) => ({ id: a.id, display_order: i })),
      });
    } catch (err: any) {
      toast.error(fieldError(err) || "Failed to reorder");
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await deleteAnn(deleting.id);
      toast.success("Announcement deleted");
      setDeleting(null);
    } catch (err: any) {
      toast.error(fieldError(err) || "Failed to delete");
    }
  };

  const toggleDay = (d: number) =>
    set(
      "days_of_week",
      form.days_of_week.includes(d)
        ? form.days_of_week.filter((x) => x !== d)
        : [...form.days_of_week, d].sort((a, b) => a - b),
    );

  const isSaving = isCreating || isUpdating;
  const hasButton = form.cta_type !== "none";

  // Language-aware field names for the Content block.
  const titleVal = lang === "de" ? form.title : form.title_en;
  const bodyVal = lang === "de" ? form.body : form.body_en;
  const labelVal = lang === "de" ? form.cta_label : form.cta_label_en;
  const setTitle = (v: string) => set(lang === "de" ? "title" : "title_en", v);
  const setBody = (v: string) => set(lang === "de" ? "body" : "body_en", v);
  const setLabel = (v: string) =>
    set(lang === "de" ? "cta_label" : "cta_label_en", v);

  return (
    <div className="p-6">
      <Toaster richColors position="top-right" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Popups, banners and menu cards shown on your store website.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No announcements yet. Create your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a, i) => {
                const st = statusOf(a);
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={i === 0 || isReordering}
                          onClick={() => move(i, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={i === rows.length - 1 || isReordering}
                          onClick={() => move(i, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {a.placement.replace("_", " ")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium">
                      {a.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {freqLabel(a.frequency)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={a.is_active}
                        onCheckedChange={() => toggleActive(a)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleting(a)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
          {/* Header */}
          <div className="flex items-start gap-3 border-b px-6 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {editing ? "Edit Announcement" : "New Announcement"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Create a popup, banner or menu card to share offers, updates and
                more.
              </p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* LEFT: form */}
              <div className="space-y-6 rounded-xl border p-5">
                {/* Placement */}
                <div className="space-y-2">
                  <Label className="font-semibold">
                    Placement <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(PLACEMENT_META) as Placement[]).map((p) => {
                      const meta = PLACEMENT_META[p];
                      const Icon = meta.icon;
                      const active = form.placement === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => set("placement", p)}
                          className={cn(
                            "group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border p-3 text-left cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
                            active
                              ? "border-primary scale-[1.02] shadow-sm ring-2 ring-primary/20"
                              : "hover:border-muted-foreground/40",
                          )}
                        >
                          {/* sliding background highlight */}
                          <span
                            aria-hidden
                            className={cn(
                              "pointer-events-none absolute inset-0 z-0 bg-primary/10 transition-transform duration-500 ease-out",
                              active ? "translate-x-0" : "-translate-x-full",
                            )}
                          />
                          {active && (
                            <span className="absolute right-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in-50 spin-in-12 duration-300">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                          <span className="relative z-10 flex w-full flex-col items-start gap-2">
                            <span
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-rotate-6",
                                active
                                  ? "bg-primary/10 text-primary scale-110"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Icon className="h-5 w-5 transition-transform duration-300" />
                            </span>
                            <span className="text-sm font-semibold">
                              {meta.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {meta.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="font-semibold">Language</Label>
                  <div className="grid w-full max-w-sm grid-cols-2 gap-2">
                    {(["de", "en"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLang(l)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                          lang === l
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted",
                        )}
                      >
                        <span>{l === "de" ? "🇩🇪" : "🇬🇧"}</span>
                        {l === "de" ? "German" : "English"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <Label className="font-semibold">Content</Label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        Title{" "}
                        {lang === "de" && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {titleVal.length} / 200
                      </span>
                    </div>
                    <Input
                      value={titleVal}
                      maxLength={200}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Weihnachtsangebot"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Description (Body)</Label>
                      <span className="text-xs text-muted-foreground">
                        {bodyVal.length} / 500
                      </span>
                    </div>
                    <Textarea
                      value={bodyVal}
                      maxLength={500}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="e.g. 10% Rabatt auf alle Bestellungen…"
                    />
                  </div>
                  {lang === "en" && (
                    <p className="text-xs text-muted-foreground">
                      Left empty, the German text is used as fallback.
                    </p>
                  )}
                </div>

                {/* Button */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="font-semibold">Button</Label>
                    <Switch
                      checked={hasButton}
                      onCheckedChange={(v) => {
                        set("cta_type", v ? "url" : "none");
                        set("cta_value", "");
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                  {hasButton && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Button Label</Label>
                        <Input
                          value={labelVal}
                          maxLength={80}
                          onChange={(e) => setLabel(e.target.value)}
                          placeholder={
                            lang === "de" ? "Mehr erfahren" : "Learn more"
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">
                          Action (CTA Type){" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={form.cta_type}
                          onValueChange={(v) => {
                            set("cta_type", v as CtaType);
                            set("cta_value", "");
                          }}
                        >
                          <SelectTrigger className="h-12 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CTA_TYPES.filter((t) => t !== "none").map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="capitalize"
                              >
                                {t === "url" ? "URL" : t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">
                          {form.cta_type === "category"
                            ? "Category"
                            : form.cta_type === "product"
                              ? "Product"
                              : "URL / Value"}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        {form.cta_type === "category" ? (
                          <SearchableSelect
                            options={categories ?? []}
                            value={
                              form.cta_value ? Number(form.cta_value) : null
                            }
                            onChange={(v) =>
                              set("cta_value", v ? String(v) : "")
                            }
                            placeholder="Select category"
                          />
                        ) : form.cta_type === "product" ? (
                          <SearchableSelect
                            options={products ?? []}
                            value={
                              form.cta_value ? Number(form.cta_value) : null
                            }
                            onChange={(v) =>
                              set("cta_value", v ? String(v) : "")
                            }
                            placeholder="Select product"
                          />
                        ) : (
                          <Input
                            value={form.cta_value}
                            onChange={(e) => set("cta_value", e.target.value)}
                            placeholder={
                              form.cta_type === "coupon"
                                ? "XMAS10"
                                : "https://magskr.com/menu"
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label className="font-semibold">Image</Label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center text-muted-foreground hover:bg-muted/50">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <UploadCloud className="h-6 w-6 text-primary" />
                      )}
                      <span className="text-sm font-semibold text-foreground">
                        Upload image
                      </span>
                      <span className="text-xs">
                        JPG, PNG, WebP • Up to 5 MB • (≈1200×675)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImage(e.target.files?.[0])}
                      />
                    </label>
                    {form.image_url && (
                      <div className="relative h-28 w-44 shrink-0">
                        <img
                          src={form.image_url}
                          alt=""
                          className="h-full w-full rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => set("image_url", "")}
                          className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-destructive shadow"
                        >
                          <Trash2 className="h-4 w-4 cursor-pointer" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: schedule */}
              <div className="space-y-6">
                {/* Schedule */}
                <div className="space-y-4 rounded-xl border p-4">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Schedule</p>
                      <p className="text-xs text-muted-foreground">
                        Set when this announcement is live.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Start Date</Label>
                      <DatePicker
                        value={form.start_at}
                        onChange={(v) => set("start_at", v)}
                        placeholder="Pick a date"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">End Date</Label>
                      <DatePicker
                        value={form.end_at}
                        onChange={(v) => set("end_at", v)}
                        placeholder="Pick a date"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Weekdays</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {WEEKDAYS.map((d, i) => {
                        const on = form.days_of_week.includes(i);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={cn(
                              "flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-sm cursor-pointer",
                              on
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:bg-muted",
                            )}
                          >
                            {on && <Check className="h-3 w-3" />}
                            {d}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      None selected = every day.
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Daily Time</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">From</Label>
                        <TimePicker
                          value={form.daily_start_time}
                          onChange={(v) => set("daily_start_time", v)}
                          placeholder="--:--"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">To</Label>
                        <TimePicker
                          value={form.daily_end_time}
                          onChange={(v) => set("daily_end_time", v)}
                          placeholder="--:--"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar: frequency / dismissible / status */}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-3 sm:divide-x">
              <div className="flex items-center gap-3 sm:pr-4">
                <Layers className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Frequency</p>
                  <p className="text-xs text-muted-foreground">
                    How often a customer sees it.
                  </p>
                </div>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => set("frequency", v as Frequency)}
                >
                  <SelectTrigger className="w-40 cursor-pointer">
                    <SelectValue className="cursor-pointer" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f} className="cursor-pointer">
                        {freqLabel(f)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 sm:px-4">
                <CircleX className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Dismissible</p>
                  <p className="text-xs text-muted-foreground">
                    Allow customers to close it.
                  </p>
                </div>
                <Switch
                  checked={form.dismissible}
                  onCheckedChange={(v) => set("dismissible", v)}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3 sm:pl-4">
                <Power className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Status</p>
                  <p className="text-xs text-muted-foreground">
                    Make it live now.
                  </p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => set("is_active", v)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={isSaving || isUploading}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {editing ? "Save changes" : "Create Announcement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete announcement?"
        description="This is permanent. To hide it without losing it, turn off 'Active' instead."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}

// Surface 422 field messages ({detail: [{loc, msg}]}) or a plain string detail.
function fieldError(err: any): string | null {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    const loc = detail[0].loc?.slice(-1)[0];
    return loc ? `${loc}: ${detail[0].msg}` : detail[0].msg;
  }
  return err?.response?.data?.message ?? null;
}

export default Announcements;
