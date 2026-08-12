// src/pages/Admin/DeliveryZone.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  useGetDeliveryZones,
  useDeleteDeliveryZone,
} from "@/hooks/useDeliveryZone";
import DeliveryZoneForm from "@/components/Forms/DeliveryZoneForm";
import { toast } from "sonner";
import type { DeliveryZone } from "@/api/deliveryZone";

// ─── Component ────────────────────────────────────────────────────────────────

function DeliveryZonePage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeliveryZone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);

  // ── Data ──
  const { data: zonesRaw, isLoading } = useGetDeliveryZones(store_id);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteDeliveryZone();

  const zones = Array.isArray(zonesRaw) ? zonesRaw : [];

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return zones;
    return zones.filter(
      (z) =>
        String(z.min_distance).includes(q) ||
        String(z.max_distance).includes(q) ||
        String(z.delivery_fee).includes(q),
    );
  }, [zones, search]);

  // ── Handlers ──
  const openAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEdit = (item: DeliveryZone) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Delivery zone deleted successfully");
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete");
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-neutral-800">
              Delivery Zone List
            </h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search zones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            <Button
              onClick={openAdd}
              className="flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    MIN DIST (km)
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    MAX DIST (km)
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    MIN ORDER
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    DELIVERY FEE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    TIME (min)
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    STATUS
                  </TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((zone, index) => (
                    <TableRow key={zone.id} className="hover:bg-muted/30">
                      <TableCell className="text-neutral-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">
                        {zone.min_distance}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">
                        {zone.max_distance}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {zone.minimum_order_amount}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {zone.delivery_fee}
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {zone.delivery_time}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            zone.is_active
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-neutral-200 text-neutral-500 bg-neutral-50"
                          }
                        >
                          {zone.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(zone)}
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Pencil size={13} /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(zone)}
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-neutral-400"
                    >
                      No delivery zones found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((zone) => (
              <div key={zone.id} className="px-4 py-3 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-neutral-800">
                        {zone.min_distance} – {zone.max_distance} km
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          zone.is_active
                            ? "border-green-200 text-green-700 bg-green-50 text-xs"
                            : "border-neutral-200 text-neutral-500 bg-neutral-50 text-xs"
                        }
                      >
                        {zone.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Fee: {zone.delivery_fee} · Min:{" "}
                      {zone.minimum_order_amount} · {zone.delivery_time} min
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(zone)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(zone)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-400 text-sm">
              No delivery zones found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${zones.length} total)`}
          </p>
        </div>
      </div>

      {/* ── Form Dialog ── */}
      <DeliveryZoneForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        editData={editingItem}
      />

      {/* ── Delete Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              Zone{" "}
              <span className="font-medium text-neutral-800">
                {deleteTarget?.min_distance} – {deleteTarget?.max_distance} km
              </span>{" "}
              permanently delete ho jaegi. Yeh action undo nahi ho sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && (
                <Loader2 className="animate-spin mr-1" size={14} />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DeliveryZonePage;
