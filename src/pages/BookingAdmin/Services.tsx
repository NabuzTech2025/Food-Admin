import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, Users, PoundSterling } from "lucide-react";
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
import type { BookingService } from "@/api/bookingV2";

const priceModes = ["flat", "per_person", "none"];

const money = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{s.name}</h3>
          {s.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{s.description}</p>
          )}
        </div>
        <Badge className={s.is_active ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}>
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
          <Users size={15} className="text-primary" /> {s.min_party}–{s.max_party}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => onEdit(s)} className="text-muted-foreground hover:text-primary" aria-label="Edit">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(s)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: "",
  description: "",
  duration_minutes: "60",
  buffer_minutes: "15",
  min_party: "1",
  max_party: "10",
  price_mode: "flat",
  price: "0",
  sort_order: "99",
  is_active: true,
};

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
  const create = useCreateService();
  const update = useUpdateService();
  const isEdit = !!service;

  const [form, setForm] = useState(emptyForm);

  // seed the form each time the dialog opens
  const [seeded, setSeeded] = useState(false);
  if (open && !seeded) {
    setForm(
      service
        ? {
            name: service.name,
            description: service.description ?? "",
            duration_minutes: String(service.duration_minutes),
            buffer_minutes: String(service.buffer_minutes),
            min_party: String(service.min_party),
            max_party: String(service.max_party),
            price_mode: service.price_mode,
            price: String(service.price),
            sort_order: String(service.sort_order),
            is_active: service.is_active,
          }
        : emptyForm,
    );
    setSeeded(true);
  }
  if (!open && seeded) setSeeded(false);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    const scalars = {
      name: form.name,
      description: form.description,
      duration_minutes: Number(form.duration_minutes),
      buffer_minutes: Number(form.buffer_minutes),
      min_party: Number(form.min_party),
      max_party: Number(form.max_party),
      price_mode: form.price_mode,
      price: Number(form.price),
      is_active: form.is_active,
      sort_order: Number(form.sort_order),
    };
    if (isEdit) {
      // preserve options/hours the form doesn't edit
      update.mutate(
        { id: service!.id, payload: { ...scalars, options: service!.options, hours: service!.hours } },
        { onSuccess: onClose },
      );
    } else {
      create.mutate({ store_id: storeId, options: [], ...scalars }, { onSuccess: onClose });
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Service" : "Create Service"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duration (min)</Label>
                <Input type="number" min={1} value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Buffer (min)</Label>
                <Input type="number" min={0} value={form.buffer_minutes} onChange={(e) => set("buffer_minutes", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Min Party</Label>
                <Input type="number" min={1} value={form.min_party} onChange={(e) => set("min_party", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Max Party</Label>
                <Input type="number" min={1} value={form.max_party} onChange={(e) => set("max_party", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Price Mode</Label>
                <Select value={form.price_mode} onValueChange={(v) => set("price_mode", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceModes.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price</Label>
                <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
            </div>
          </div>

          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{isEdit ? "Save Changes" : "Create Service"}</Button>
          </DialogFooter>
        </form>
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
          <p className="text-sm text-muted-foreground">Bookable packages &amp; events</p>
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
            <ServiceCard key={s.id} s={s} onEdit={openEdit} onDelete={setDeleting} />
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
