import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Pencil, Trash2, Users, Box } from "lucide-react";
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
  useResources,
  useBookingStoreId,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "@/hooks/useBookingV2";
import type { CapacityMode, Resource } from "@/api/bookingV2";

const capacityModes: CapacityMode[] = ["exclusive", "pooled"];

type FormValues = {
  name: string;
  capacity: string;
  capacity_mode: CapacityMode;
  sort_order: string;
  is_active: boolean;
};

const defaultsFrom = (r: Resource | null): FormValues => ({
  name: r?.name ?? "",
  capacity: String(r?.capacity ?? 1),
  capacity_mode: r?.capacity_mode ?? "exclusive",
  sort_order: String(r?.sort_order ?? 99),
  is_active: r?.is_active ?? true,
});

function ResourceForm({
  storeId,
  resource,
  onClose,
}: {
  storeId: number;
  resource: Resource | null;
  onClose: () => void;
}) {
  const create = useCreateResource();
  const update = useUpdateResource();
  const isEdit = !!resource;

  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: defaultsFrom(resource),
  });

  const onSubmit = (v: FormValues) => {
    const payload = {
      name: v.name,
      capacity: Number(v.capacity),
      capacity_mode: v.capacity_mode,
      sort_order: Number(v.sort_order),
      is_active: v.is_active,
    };
    if (isEdit) {
      update.mutate({ id: resource!.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate({ store_id: storeId, ...payload }, { onSuccess: onClose });
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Resource" : "Create Resource"}</DialogTitle>
      </DialogHeader>

      <div className="mt-3 space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input placeholder="e.g. Stadium" {...register("name", { required: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Capacity</Label>
            <Input type="number" min={1} {...register("capacity")} />
          </div>
          <div className="space-y-1.5">
            <Label>Capacity Mode</Label>
            <Controller
              control={control}
              name="capacity_mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {capacityModes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <b>exclusive</b> — a booking uses the whole resource (1 unit).{" "}
          <b>pooled</b> — a booking uses party_size units of the capacity.
        </p>
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
          {isEdit ? "Save Changes" : "Create Resource"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Resources() {
  const storeId = useBookingStoreId();
  const { data: resources = [], isLoading } = useResources(storeId);
  const del = useDeleteResource();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: Resource) => {
    setEditing(r);
    setFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-component-bg border border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Resources</h1>
          <p className="text-sm text-muted-foreground">
            The stadium, chairs or rooms a booking uses up
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Create Resource
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          No resources yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <div
              key={r.id}
              className="rounded-xl bg-component-bg border border-border p-5 flex items-center gap-4"
            >
              <span className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Box size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">
                  {r.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Users size={15} className="text-primary" /> {r.capacity}
                  </span>
                  <span className="capitalize">{r.capacity_mode}</span>
                </div>
              </div>
              <Badge
                className={
                  r.is_active
                    ? "bg-green-600 text-white"
                    : "bg-muted text-muted-foreground"
                }
              >
                {r.is_active ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(r)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleting(r)}
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
            <ResourceForm
              key={editing?.id ?? "new"}
              storeId={storeId}
              resource={editing}
              onClose={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete resource?"
        description={`"${deleting?.name}" will be permanently removed. A resource still used by a service cannot be deleted — set it inactive instead.`}
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

export default Resources;
