// src/pages/Admin/DeliveryZone.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Loader2,
  MapPin,
  Package,
  Clock,
  Banknote,
  TrendingUp,
  Route,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import type { DeliveryZone } from "@/api/deliveryZones";
import {
  useGetDeliveryZones,
  useDeleteDeliveryZone,
} from "@/hooks/useDeliveryZone";
import DeliveryZoneForm from "@/components/Forms/DeliveryZoneForm";

// ── stat item ────────────────────────────────────────────────────
function StatItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          highlight
            ? "bg-orange-50 text-orange-500"
            : "bg-neutral-50 text-neutral-400"
        }`}
      >
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-semibold leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-neutral-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// ── zone card ────────────────────────────────────────────────────
function ZoneCard({
  zone,
  index,
  onEdit,
  onDelete,
}: {
  zone: DeliveryZone;
  index: number;
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (id: number) => void;
}) {
  const isActive = zone.is_active;

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
        isActive
          ? "border-neutral-200 shadow-sm"
          : "border-neutral-100 shadow-sm opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-700">
            Zone {index + 1}
          </span>
          <span className="text-neutral-300">·</span>
          <div className="flex items-center gap-1">
            <Route size={11} className="text-neutral-400" />
            <span className="text-xs text-neutral-500">
              {zone.min_distance}–{zone.max_distance} km
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isActive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-neutral-100 text-neutral-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <StatItem
          icon={Banknote}
          label="Fee"
          value={`€${zone.delivery_fee}`}
          highlight={isActive}
        />
        <StatItem
          icon={Package}
          label="Min Order"
          value={`€${zone.minimum_order_amount}`}
        />
        <StatItem
          icon={Clock}
          label="Est. Time"
          value={`${zone.delivery_time} min`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(zone)}
          className="flex-1 h-8 text-xs gap-1.5"
        >
          <Pencil size={12} />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(zone.id)}
          className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}

// ── summary card ─────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm px-4 py-3 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-neutral-400 font-medium">{label}</p>
        <p className="text-base font-bold text-neutral-800 leading-tight">
          {value}
          {sub && (
            <span className="text-xs font-normal text-neutral-400 ml-1">
              {sub}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── empty state ──────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="col-span-full bg-white rounded-xl border border-dashed border-neutral-200 flex flex-col items-center justify-center py-16 text-center">
      <MapPin size={22} className="text-neutral-300 mb-3" />
      <p className="text-sm font-medium text-neutral-600">No delivery zones</p>
      <p className="text-xs text-neutral-400 mt-1 mb-4">
        Add a zone to start accepting deliveries.
      </p>
      <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5">
        <Plus size={14} />
        Add First Zone
      </Button>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────
function DeliveryZonePage() {
  const { store_id } = useAdminStore();
  const { data: zones, isLoading } = useGetDeliveryZones(store_id);
  const { mutateAsync: deleteZone, isPending: isDeleting } =
    useDeleteDeliveryZone();

  const [formOpen, setFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // The max_distance of the last zone becomes the next zone's min_distance
  const lastMaxDistance = zones?.length
    ? Math.max(...zones.map((z) => z.max_distance))
    : 0;

  const openAddForm = () => {
    setEditingZone(null);
    setFormOpen(true);
  };

  const openEditForm = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteZone(deletingId);
      toast.success("Zone deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete zone");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const totalZones = zones?.length ?? 0;
  const activeCount =
    zones?.filter((z: DeliveryZone) => z.is_active).length ?? 0;

  return (
    <div className="space-y-4">
      <Toaster />

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-neutral-800">
            Delivery Zones
          </h1>
          {!isLoading && totalZones > 0 && (
            <p className="text-xs text-neutral-400 mt-0.5">
              {totalZones} zone{totalZones !== 1 ? "s" : ""} · {activeCount}{" "}
              active
            </p>
          )}
        </div>
        <Button onClick={openAddForm} size="sm" className="gap-1.5">
          <Plus size={15} />
          <span className="hidden sm:inline">Add New Zone</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* ── summary ── */}
      {!isLoading && totalZones > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Route}
            label="Total Zones"
            value={totalZones}
            color="bg-neutral-100 text-neutral-500"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Active Zones"
            value={activeCount}
            sub={`/ ${totalZones}`}
            color="bg-emerald-50 text-emerald-500"
          />
        </div>
      )}

      {/* ── grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <Loader2 className="animate-spin text-neutral-400" size={24} />
          </div>
        ) : zones && zones.length > 0 ? (
          zones.map((zone: DeliveryZone, index: number) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              index={index}
              onEdit={openEditForm}
              onDelete={openDeleteDialog}
            />
          ))
        ) : (
          <EmptyState onAdd={openAddForm} />
        )}
      </div>

      {/* ── Form (Add & Edit) ── */}
      <DeliveryZoneForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingZone={editingZone}
        lastMaxDistance={lastMaxDistance} // auto min_distance for new zones
      />

      {/* ── Delete Dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this zone? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DeliveryZonePage;
