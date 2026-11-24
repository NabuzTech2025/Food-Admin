import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Plus, Pencil, Trash2, CalendarOff, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useBookingStoreId, useServices } from "@/hooks/useBookingV2";
import {
  useBlockedDates,
  useCreateBlockedDate,
  useUpdateBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/useBlockedDates";
import type { AppliesTo, BlockedDate } from "@/api/blockedDates";

const ALL_SERVICES = "all";

// This screen is embedded in both Booking Admin and the Reservation dashboard.
// The mode fixes applies_to and whether the package selector is shown.
export type BlockMode = "booking" | "reservation";

const APPLIES_LABEL: Record<AppliesTo, string> = {
  all: "Reservations & Bookings",
  reservation: "Reservations only",
  booking: "Bookings only",
};

const fmt = (d: string) => format(parse(d, "yyyy-MM-dd", new Date()), "PP");
const dateLabel = (b: BlockedDate) =>
  b.end_date && b.end_date !== b.start_date
    ? `${fmt(b.start_date)} – ${fmt(b.end_date)}`
    : fmt(b.start_date);

const toDate = (s: string) =>
  s ? parse(s, "yyyy-MM-dd", new Date()) : undefined;
const toStr = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");

// One calendar for a single day or a range. Click one day for a single date,
// or a start + end day for a range. Writes back yyyy-MM-dd strings.
function DateRangePicker({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) {
  const from = toDate(start);
  const to = toDate(end);
  const range: DateRange | undefined = from ? { from, to } : undefined;

  const label = !from
    ? "Pick a date or range"
    : to && end !== start
      ? `${format(from, "PP")} – ${format(to, "PP")}`
      : format(from, "PP");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
          {from ? label : <span className="text-muted-foreground">{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(r) => onChange(toStr(r?.from), toStr(r?.to))}
          numberOfMonths={2}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

type FormValues = {
  name: string;
  start_date: string;
  end_date: string; // "" = single day
  service_id: string; // "all" or service id
  is_active: boolean;
};

const defaultsFrom = (b: BlockedDate | null): FormValues => ({
  name: b?.name ?? "",
  start_date: b?.start_date ?? "",
  end_date: b?.end_date ?? "",
  service_id: b?.service_id != null ? String(b.service_id) : ALL_SERVICES,
  is_active: b?.is_active ?? true,
});

function BlockedDateForm({
  storeId,
  blockedDate,
  mode,
  onClose,
}: {
  storeId: number;
  blockedDate: BlockedDate | null;
  mode: BlockMode;
  onClose: () => void;
}) {
  const { data: services = [] } = useServices(storeId, true);
  const create = useCreateBlockedDate();
  const update = useUpdateBlockedDate();
  const isEdit = !!blockedDate;
  const isBooking = mode === "booking";

  const { control, register, handleSubmit, watch, setValue } =
    useForm<FormValues>({ defaultValues: defaultsFrom(blockedDate) });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const onSubmit = (v: FormValues) => {
    if (!v.start_date) {
      toast.error("Start date is required");
      return;
    }
    if (v.end_date && v.end_date < v.start_date) {
      toast.error("End date must be on or after the start date");
      return;
    }
    // service_id is Booking v2 only (not allowed with "reservation").
    const service_id =
      isBooking && v.service_id !== ALL_SERVICES ? Number(v.service_id) : null;

    if (isEdit) {
      update.mutate(
        {
          id: blockedDate!.id,
          payload: {
            name: v.name.trim() || null,
            start_date: v.start_date,
            end_date: v.end_date || null,
            applies_to: mode,
            service_id,
            is_active: v.is_active,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(
        {
          store_id: storeId,
          name: v.name.trim() || undefined,
          start_date: v.start_date,
          end_date: v.end_date || undefined,
          applies_to: mode,
          service_id,
          is_active: v.is_active,
        },
        { onSuccess: onClose },
      );
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Edit Blocked Date" : "Block a Date"}
        </DialogTitle>
      </DialogHeader>

      <div className="mt-3 space-y-4">
        <div className="space-y-1.5">
          <Label>Name (optional)</Label>
          <Input
            placeholder="e.g. Silvester – fully booked"
            {...register("name")}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Date / Range</Label>
            {startDate && (
              <button
                type="button"
                onClick={() => {
                  setValue("start_date", "");
                  setValue("end_date", "");
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            )}
          </div>
          <DateRangePicker
            start={startDate}
            end={endDate}
            onChange={(s, e) => {
              setValue("start_date", s);
              setValue("end_date", e);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Click one day for a single date, or a start and end day for a range.
            Both dates are inclusive.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Applies to</Label>
          <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            {APPLIES_LABEL[mode]}
          </div>
        </div>

        {isBooking && (
          <div className="space-y-1.5">
            <Label>Package</Label>
            <Controller
              control={control}
              name="service_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_SERVICES}>All packages</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Leave as “All packages” to block every package that day.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>Active</Label>
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <DialogFooter className="mt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {isEdit ? "Save Changes" : "Block Date"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function BlockedDates({ mode = "booking" }: { mode?: BlockMode }) {
  const storeId = useBookingStoreId();
  const { data: allBlocked = [], isLoading } = useBlockedDates(storeId);
  const { data: services = [] } = useServices(storeId, true);
  const del = useDeleteBlockedDate();

  // Show rows relevant to this screen: this mode's rows plus "all" rows.
  const blocked = allBlocked.filter(
    (b) => b.applies_to === mode || b.applies_to === "all",
  );

  const serviceName = (id: number | null) =>
    id == null
      ? null
      : (services.find((s) => s.id === id)?.name ?? `#${id}`);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BlockedDate | null>(null);
  const [deleting, setDeleting] = useState<BlockedDate | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b: BlockedDate) => {
    setEditing(b);
    setFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Blocked Dates</h1>
          <p className="text-sm text-muted-foreground">
            Block specific days or ranges for reservations / bookings. Online
            ordering stays open.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Block a Date
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : blocked.length === 0 ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          No blocked dates yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {blocked.map((b) => {
            const svc = serviceName(b.service_id);
            return (
              <div
                key={b.id}
                className="rounded-xl bg-component-bg border border-border p-5 flex items-center gap-4"
              >
                <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <CalendarOff size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {b.name || dateLabel(b)}
                  </h3>
                  <div className="flex items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground mt-0.5 flex-wrap">
                    {b.name && <span>{dateLabel(b)}</span>}
                    <span>{APPLIES_LABEL[b.applies_to]}</span>
                    {svc && <span>Package: {svc}</span>}
                  </div>
                </div>
                <Badge
                  className={
                    b.is_active
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {b.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(b)}
                    className="text-muted-foreground hover:text-primary"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleting(b)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-lg">
          {formOpen && storeId && (
            <BlockedDateForm
              key={editing?.id ?? "new"}
              storeId={storeId}
              blockedDate={editing}
              mode={mode}
              onClose={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete blocked date?"
        description={`"${deleting?.name || (deleting ? dateLabel(deleting) : "")}" will be removed and the day bookable again.`}
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

export default BlockedDates;
