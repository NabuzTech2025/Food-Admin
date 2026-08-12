// src/pages/Admin/Delivery.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useGetDeliveryTimePlans,
  useDeleteDeliveryTimePlan,
} from "@/hooks/useDeliveryTimePlan";
import DeliveryTimePlanForm from "@/components/Forms/DeliveryTimePlanForm";
import { toast } from "sonner";
import type {
  DeliveryTimePlan,
  GroupedDeliveryTimePlan,
} from "@/api/deliveryTimePlan";

const DAYS_OF_WEEK = [
  { name: "Monday", short: "Mo", value: 0 },
  { name: "Tuesday", short: "Tu", value: 1 },
  { name: "Wednesday", short: "We", value: 2 },
  { name: "Thursday", short: "Th", value: 3 },
  { name: "Friday", short: "Fr", value: 4 },
  { name: "Saturday", short: "Sa", value: 5 },
  { name: "Sunday", short: "Su", value: 6 },
];

function groupPlans(plans: DeliveryTimePlan[]): GroupedDeliveryTimePlan[] {
  const map = new Map<string, GroupedDeliveryTimePlan>();
  for (const plan of plans) {
    const key = `${plan.start_time}__${plan.end_time}`;
    if (!map.has(key)) {
      map.set(key, {
        start_time: plan.start_time,
        end_time: plan.end_time,
        days: [],
        ids: [],
        names: [],
      });
    }
    const group = map.get(key)!;
    group.days.push(plan.day_of_week);
    group.ids.push(plan.id);
    group.names.push(plan.name);
  }
  return Array.from(map.values());
}

const fmt = (t: string) => t.slice(0, 5);

function DeliveryPage() {
  const { store_id } = useAdminStore();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<GroupedDeliveryTimePlan | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<GroupedDeliveryTimePlan | null>(null);

  const { data: plansRaw, isLoading } = useGetDeliveryTimePlans(store_id);
  const { mutateAsync: deleteItem, isPending: isDeleting } =
    useDeleteDeliveryTimePlan();

  const plans = Array.isArray(plansRaw) ? plansRaw : [];
  const grouped = useMemo(() => groupPlans(plans), [plans]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return grouped;
    return grouped.filter(
      (g) =>
        g.names.some((n) => n.toLowerCase().includes(q)) ||
        fmt(g.start_time).includes(q) ||
        fmt(g.end_time).includes(q),
    );
  }, [grouped, search]);

  const openAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEdit = (item: GroupedDeliveryTimePlan) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await Promise.all(deleteTarget.ids.map((id) => deleteItem(id)));
      toast.success("Delivery time deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-neutral-800">
              Delivery Time Plans
            </h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search..."
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

        {/* Desktop Table */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 font-semibold text-neutral-700">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    DAYS
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    OPENING
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    CLOSING
                  </TableHead>
                  <TableHead className="text-right font-semibold text-neutral-700">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((group, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="text-neutral-500">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {DAYS_OF_WEEK.map((day) => (
                            <span
                              key={day.value}
                              title={day.name}
                              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                                group.days.includes(day.value)
                                  ? "bg-primary text-white border-primary"
                                  : "bg-muted text-neutral-300 border-neutral-200"
                              }`}
                            >
                              {day.short}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-700 font-medium">
                        {fmt(group.start_time)}
                      </TableCell>
                      <TableCell className="text-neutral-700 font-medium">
                        {fmt(group.end_time)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(group)}
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Pencil size={13} /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(group)}
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
                      colSpan={5}
                      className="text-center py-10 text-neutral-400"
                    >
                      No delivery time plans found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((group, index) => (
              <div key={index} className="px-4 py-3 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">
                      {fmt(group.start_time)} – {fmt(group.end_time)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <span
                          key={day.value}
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${group.days.includes(day.value) ? "bg-primary text-white border-primary" : "bg-muted text-neutral-300 border-neutral-200"}`}
                        >
                          {day.short}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(group)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(group)}
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
              No delivery time plans found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${grouped.length} total)`}
          </p>
        </div>
      </div>

      <DeliveryTimePlanForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        editData={editingItem}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Time?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.ids.length} entries permanently delete ho jaengi.
              Yeh action undo nahi ho sakta.
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

export default DeliveryPage;
