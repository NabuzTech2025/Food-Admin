import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Pencil, Trash2, Clock, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  useBlackouts,
  useServices,
  useBookingStoreId,
  useCreateBlackouts,
  useUpdateBlackout,
  useDeleteBlackout,
} from "@/hooks/useBookingV2";
import type { Blackout } from "@/api/bookingV2";

// 0-6, matching the day_of_week convention used by service hours.
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_SERVICES = "all";

type FormValues = {
  name: string;
  service_id: string; // "all" or service id
  day_of_week: string; // "0".."6"
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  sort_order: string;
  is_active: boolean;
};

const defaultsFrom = (b: Blackout | null): FormValues => ({
  name: b?.name ?? "",
  service_id: b?.service_id != null ? String(b.service_id) : ALL_SERVICES,
  day_of_week: String(b?.day_of_week ?? 0),
  start_time: b?.start_time?.slice(0, 5) ?? "12:00",
  end_time: b?.end_time?.slice(0, 5) ?? "13:00",
  sort_order: String(b?.sort_order ?? 99),
  is_active: b?.is_active ?? true,
});

function BlackoutForm({
  storeId,
  blackout,
  onClose,
}: {
  storeId: number;
  blackout: Blackout | null;
  onClose: () => void;
}) {
  const { data: services = [] } = useServices(storeId, true);
  const create = useCreateBlackouts();
  const update = useUpdateBlackout();
  const isEdit = !!blackout;

  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: defaultsFrom(blackout),
  });

  const onSubmit = (v: FormValues) => {
    const block = {
      name: v.name,
      service_id: v.service_id === ALL_SERVICES ? null : Number(v.service_id),
      day_of_week: Number(v.day_of_week),
      start_time: `${v.start_time}:00`,
      end_time: `${v.end_time}:00`,
      is_active: v.is_active,
      sort_order: Number(v.sort_order),
    };
    if (isEdit) {
      update.mutate({ id: blackout!.id, payload: block }, { onSuccess: onClose });
    } else {
      create.mutate({ storeId, blocks: [block] }, { onSuccess: onClose });
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Blackout" : "Create Blackout"}</DialogTitle>
      </DialogHeader>

      <div className="mt-3 space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input
            placeholder="e.g. Lunch break"
            {...register("name", { required: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Service</Label>
          <Controller
            control={control}
            name="service_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SERVICES}>All services</SelectItem>
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
            Leave as “All services” to block the whole store.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Day</Label>
            <Controller
              control={control}
              name="day_of_week"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
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
          </div>
          <div className="space-y-1.5">
            <Label>Start</Label>
            <Input type="time" {...register("start_time")} />
          </div>
          <div className="space-y-1.5">
            <Label>End</Label>
            <Input type="time" {...register("end_time")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Sort Order</Label>
          <Input type="number" {...register("sort_order")} />
        </div>

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
          {isEdit ? "Save Changes" : "Create Blackout"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Blackouts() {
  const storeId = useBookingStoreId();
  const { data: blackouts = [], isLoading } = useBlackouts(storeId);
  const { data: services = [] } = useServices(storeId, true);
  const del = useDeleteBlackout();

  const serviceName = (id: number | null) =>
    id == null ? "All services" : (services.find((s) => s.id === id)?.name ?? `#${id}`);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Blackout | null>(null);
  const [deleting, setDeleting] = useState<Blackout | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b: Blackout) => {
    setEditing(b);
    setFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Blackouts</h1>
          <p className="text-sm text-muted-foreground">
            Recurring weekly windows when bookings are blocked
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Create Blackout
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : blackouts.length === 0 ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          No blackouts yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {blackouts.map((b) => (
            <div
              key={b.id}
              className="rounded-xl bg-component-bg border border-border p-5 flex items-center gap-4"
            >
              <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                <CalendarX size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">
                  {b.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5 flex-wrap">
                  <span>{days[b.day_of_week] ?? `Day ${b.day_of_week}`}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} className="text-primary" />
                    {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                  </span>
                  <span>{serviceName(b.service_id)}</span>
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
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-lg">
          {formOpen && storeId && (
            <BlackoutForm
              key={editing?.id ?? "new"}
              storeId={storeId}
              blackout={editing}
              onClose={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete blackout?"
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

export default Blackouts;
