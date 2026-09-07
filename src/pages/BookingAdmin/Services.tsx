import { useRef, useState } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Users,
  PoundSterling,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useServices,
  useBookingStoreId,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/useBookingV2";
import { useUploadImage } from "@/hooks/Common/useUploadImage";
import type { BookingService } from "@/api/bookingV2";

const priceModes = ["flat", "per_person", "none"];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const money = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    n,
  );

// nullable number field -> value or null when empty
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

function ServiceCard({
  s,
  onEdit,
  onDelete,
}: {
  s: BookingService;
  onEdit: (s: BookingService) => void;
  onDelete: (s: BookingService) => void;
}) {
  return (
    <div className="rounded-xl bg-component-bg border border-border p-5 space-y-3">
      <div className="flex items-start gap-3">
        {s.image_url && (
          <img
            src={s.image_url.split("?")[0]}
            alt=""
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{s.name}</h3>
          {s.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {s.description}
            </p>
          )}
        </div>
        <Badge
          className={
            s.is_active
              ? "bg-green-600 text-white"
              : "bg-muted text-muted-foreground"
          }
        >
          {s.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="flex items-center gap-5 border-t border-border pt-3 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <PoundSterling size={15} className="text-primary" /> {money(s.price)}
          {s.price_mode !== "flat" && s.price_mode !== "none" && (
            <span className="text-xs">/{s.price_mode}</span>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={15} className="text-primary" /> {s.duration_minutes} min
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={15} className="text-primary" /> {s.min_party}–
          {s.max_party}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onEdit(s)}
            className="text-muted-foreground hover:text-primary"
            aria-label="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

type OptionField = {
  name: string;
  price_delta: string;
  price_mode: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: string;
};
type HourField = { day_of_week: string; start_time: string; end_time: string };
type FormValues = {
  name: string;
  description: string;
  duration_minutes: string;
  buffer_minutes: string;
  min_party: string;
  max_party: string;
  price_mode: string;
  price: string;
  deposit_amount: string;
  slot_interval_minutes: string;
  lead_time_minutes: string;
  booking_window_days: string;
  sort_order: string;
  is_active: boolean;
  require_payment: boolean;
  options: OptionField[];
  hours: HourField[];
};

const defaultsFrom = (s: BookingService | null): FormValues => ({
  name: s?.name ?? "",
  description: s?.description ?? "",
  duration_minutes: String(s?.duration_minutes ?? 60),
  buffer_minutes: String(s?.buffer_minutes ?? 15),
  min_party: String(s?.min_party ?? 1),
  max_party: String(s?.max_party ?? 10),
  price_mode: s?.price_mode ?? "flat",
  price: String(s?.price ?? 0),
  deposit_amount: s?.deposit_amount != null ? String(s.deposit_amount) : "",
  slot_interval_minutes:
    s?.slot_interval_minutes != null ? String(s.slot_interval_minutes) : "",
  lead_time_minutes:
    s?.lead_time_minutes != null ? String(s.lead_time_minutes) : "",
  booking_window_days:
    s?.booking_window_days != null ? String(s.booking_window_days) : "",
  sort_order: String(s?.sort_order ?? 99),
  is_active: s?.is_active ?? true,
  require_payment: s?.require_payment ?? false,
  options: (s?.options ?? []).map((o) => ({
    name: o.name,
    price_delta: String(o.price_delta),
    price_mode: o.price_mode,
    is_default: o.is_default,
    is_active: o.is_active,
    sort_order: String(o.sort_order),
  })),
  hours: (s?.hours ?? []).map((h) => ({
    day_of_week: String(h.day_of_week),
    start_time: h.start_time.slice(0, 5),
    end_time: h.end_time.slice(0, 5),
  })),
});

const MAX_MB = 25;

function Dropzone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return toast.error("Please select an image file");
    if (f.size > MAX_MB * 1024 * 1024)
      return toast.error(`Max file size is ${MAX_MB} MB`);
    onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 cursor-pointer text-center transition-colors",
        dragging
          ? "border-primary bg-primary-light/40"
          : "border-border hover:border-primary bg-off-bg",
      )}
    >
      <span className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center">
        <UploadCloud size={22} />
      </span>
      <p className="text-sm font-medium text-foreground">
        Click to Upload or drag and drop
      </p>
      <p className="text-xs text-muted-foreground">
        (Max. File size: {MAX_MB} MB)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
    </div>
  );
}

function ServiceForm({
  storeId,
  service,
  onClose,
}: {
  storeId: number;
  service: BookingService | null;
  onClose: () => void;
}) {
  const create = useCreateService();
  const update = useUpdateService();
  const upload = useUploadImage();
  const isEdit = !!service;

  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: defaultsFrom(service),
  });
  const options = useFieldArray({ control, name: "options" });
  const hours = useFieldArray({ control, name: "hours" });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    service?.image_url?.split("?")[0] ?? "",
  );

  const onSubmit = async (v: FormValues) => {
    let imageUrl = imagePreview;
    if (imageFile) {
      try {
        const res = await upload.mutateAsync({ file: imageFile });
        imageUrl = res.url || res.image_url || "";
      } catch {
        return;
      }
    }

    const payload = {
      name: v.name,
      description: v.description,
      image_url: imageUrl || undefined,
      duration_minutes: Number(v.duration_minutes),
      buffer_minutes: Number(v.buffer_minutes),
      min_party: Number(v.min_party),
      max_party: Number(v.max_party),
      price_mode: v.price_mode,
      price: Number(v.price),
      deposit_amount: numOrNull(v.deposit_amount),
      require_payment: v.require_payment,
      slot_interval_minutes: numOrNull(v.slot_interval_minutes),
      lead_time_minutes: numOrNull(v.lead_time_minutes),
      booking_window_days: numOrNull(v.booking_window_days),
      is_active: v.is_active,
      sort_order: Number(v.sort_order),
      options: v.options.map((o) => ({
        name: o.name,
        price_delta: Number(o.price_delta),
        price_mode: o.price_mode,
        is_default: o.is_default,
        is_active: o.is_active,
        sort_order: Number(o.sort_order),
      })),
      hours: v.hours.map((h) => ({
        day_of_week: Number(h.day_of_week),
        start_time: `${h.start_time}:00`,
        end_time: `${h.end_time}:00`,
      })),
    };

    if (isEdit) {
      update.mutate({ id: service!.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate({ store_id: storeId, ...payload }, { onSuccess: onClose });
    }
  };

  const pending = create.isPending || update.isPending || upload.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Service" : "Create Service"}</DialogTitle>
      </DialogHeader>

      <div className="mt-3 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Left — core fields in 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Column 1 — image + identity */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <Dropzone
                  onFile={(f) => {
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" {...register("sort_order")} />
            </div>
          </div>

          {/* Column 2 — scheduling / capacity */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min={1} {...register("duration_minutes")} />
            </div>
            <div className="space-y-1.5">
              <Label>Buffer (min)</Label>
              <Input type="number" min={0} {...register("buffer_minutes")} />
            </div>
            <div className="space-y-1.5">
              <Label>Min Party</Label>
              <Input type="number" min={1} {...register("min_party")} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Party</Label>
              <Input type="number" min={1} {...register("max_party")} />
            </div>
            <div className="space-y-1.5">
              <Label>Slot Interval (min)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Optional"
                {...register("slot_interval_minutes")}
              />
            </div>
          </div>

          {/* Column 3 — pricing / windows / flags */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Price Mode</Label>
              <Controller
                control={control}
                name="price_mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceModes.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price</Label>
              <Input type="number" min={0} step="0.01" {...register("price")} />
            </div>
            <div className="space-y-1.5">
              <Label>Deposit Amount</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Optional"
                {...register("deposit_amount")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lead Time (min)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Optional"
                {...register("lead_time_minutes")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Booking Window (days)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Optional"
                {...register("booking_window_days")}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Label>Require Payment</Label>
              <Controller
                control={control}
                name="require_payment"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Right — options & opening hours */}
        <div className="space-y-6 xl:border-l xl:border-border xl:pl-6">
          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options / Add-ons</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  options.append({
                    name: "",
                    price_delta: "0",
                    price_mode: "flat",
                    is_default: false,
                    is_active: true,
                    sort_order: String(options.fields.length),
                  })
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            {options.fields.map((f, i) => (
              <div
                key={f.id}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Option name"
                    {...register(`options.${i}.name` as const)}
                  />
                  <button
                    type="button"
                    onClick={() => options.remove(i)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price delta"
                    {...register(`options.${i}.price_delta` as const)}
                  />
                  <Controller
                    control={control}
                    name={`options.${i}.price_mode` as const}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceModes.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`options.${i}.is_default` as const}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    Default
                  </label>
                  <label className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`options.${i}.is_active` as const}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    Active
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Hours */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label>Opening Hours</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  hours.append({
                    day_of_week: "1",
                    start_time: "09:00",
                    end_time: "17:00",
                  })
                }
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            {hours.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={`hours.${i}.day_of_week` as const}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d, idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  type="time"
                  {...register(`hours.${i}.start_time` as const)}
                />
                <Input
                  type="time"
                  {...register(`hours.${i}.end_time` as const)}
                />
                <button
                  type="button"
                  onClick={() => hours.remove(i)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {isEdit ? "Save Changes" : "Create Service"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ServiceFormDialog({
  storeId,
  service,
  open,
  onClose,
}: {
  storeId: number | null;
  service: BookingService | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] h-[95vh] max-h-[95vh] overflow-y-auto">
        {open && storeId && (
          <ServiceForm
            key={service?.id ?? "new"}
            storeId={storeId}
            service={service}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Services() {
  const storeId = useBookingStoreId();
  const { data: services = [], isLoading } = useServices(storeId, true);
  const del = useDeleteService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BookingService | null>(null);
  const [deleting, setDeleting] = useState<BookingService | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: BookingService) => {
    setEditing(s);
    setFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Bookable packages &amp; events
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Create Service
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          No services yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              s={s}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <ServiceFormDialog
        storeId={storeId}
        service={editing}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete service?"
        description={`"${deleting?.name}" will be permanently removed.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={del.isPending}
        onConfirm={() => {
          if (deleting) del.mutate(deleting.id);
        }}
      />
    </div>
  );
}

export default Services;
