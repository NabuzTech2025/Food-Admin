// src/pages/Admin/CategoryAvailability.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
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
  useGetCategoryAvailabilities,
  useDeleteCategoryAvailability,
} from "@/hooks/useCategoryAvailability";
import { useGetCategory } from "@/hooks/useCategory";
import CategoryAvailabilityForm from "@/components/Forms/CategoryAvailabilityForm";
import { toast } from "sonner";
import type { GroupedAvailability } from "@/api/categoryAvailability";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = [
  { name: "Monday", short: "Mo", value: 0 },
  { name: "Tuesday", short: "Tu", value: 1 },
  { name: "Wednesday", short: "We", value: 2 },
  { name: "Thursday", short: "Th", value: 3 },
  { name: "Friday", short: "Fr", value: 4 },
  { name: "Saturday", short: "Sa", value: 5 },
  { name: "Sunday", short: "Su", value: 6 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (t: string) => t?.slice(0, 5) ?? "-";

function CategoryAvailabilityPage() {
  const { store_id } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupedAvailability | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<GroupedAvailability | null>(
    null,
  );
  const [isDeletePending, setIsDeletePending] = useState(false);

  // ── Data ──
  const { data: availabilities, isLoading: isLoadingAv } =
    useGetCategoryAvailabilities();
  const { data: categoriesData, isLoading: isLoadingCat } =
    useGetCategory(store_id);
  const isLoading = isLoadingAv || isLoadingCat;

  const categoryList = Array.isArray(categoriesData)
    ? categoriesData
    : ((categoriesData as any)?.data ?? []);

  const { mutateAsync: deleteItem } = useDeleteCategoryAvailability();

  // ── Group availabilities ──
  const groupedList = useMemo((): GroupedAvailability[] => {
    const raw = Array.isArray(availabilities) ? availabilities : [];
    const grouped: Record<string, GroupedAvailability> = {};

    raw.forEach((item) => {
      const key = `${item.category_id}_${item.start_time}_${item.end_time}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: item.id,
          category_id: item.category_id,
          start_time: item.start_time,
          end_time: item.end_time,
          isActive: item.isActive,
          days: [],
          items: [],
        };
      }
      grouped[key].days.push(item.day_of_week);
      grouped[key].items.push(item);
    });

    return Object.values(grouped);
  }, [availabilities]);

  // ── Helpers ──
  const getCategoryName = (id: number) =>
    categoryList.find((c: any) => c.id === id)?.name ?? "Unknown";

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return groupedList;
    return groupedList.filter((item) =>
      getCategoryName(item.category_id).toLowerCase().includes(q),
    );
  }, [groupedList, search, categoryList]);

  // ── Handlers ──
  const openAddForm = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEditForm = (item: GroupedAvailability) => {
    setEditingItem(item);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletePending(true);
    try {
      for (const item of deleteTarget.items) {
        await deleteItem(item.id);
      }
      toast.success("Category availability deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setIsDeletePending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Category Availability List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            <Button
              onClick={openAddForm}
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
                    CATEGORY
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
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={24}
                      />
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <TableRow
                      key={`${item.category_id}_${item.start_time}_${item.end_time}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-neutral-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">
                        {getCategoryName(item.category_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {item.days
                            .sort((a, b) => a - b)
                            .map((d) => (
                              <span
                                key={d}
                                title={
                                  DAYS_OF_WEEK.find((day) => day.value === d)
                                    ?.name
                                }
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                              >
                                {
                                  DAYS_OF_WEEK.find((day) => day.value === d)
                                    ?.short
                                }
                              </span>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-700 font-medium">
                        {formatTime(item.start_time)}
                      </TableCell>
                      <TableCell className="text-neutral-700 font-medium">
                        {formatTime(item.end_time)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isActive ? "default" : "secondary"}
                          className={
                            item.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : ""
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(item)}
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Pencil size={13} />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(item)}
                            className="flex items-center gap-1 h-8 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-neutral-400"
                    >
                      No category availability found.
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
            filtered.map((item) => (
              <div
                key={`${item.category_id}_${item.start_time}_${item.end_time}`}
                className="px-4 py-3 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-800">
                        {getCategoryName(item.category_id)}
                      </p>
                      <Badge
                        variant={item.isActive ? "default" : "secondary"}
                        className={`text-xs ${item.isActive ? "bg-green-100 text-green-700" : ""}`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatTime(item.start_time)} –{" "}
                      {formatTime(item.end_time)}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.days
                        .sort((a, b) => a - b)
                        .map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                          >
                            {DAYS_OF_WEEK.find((day) => day.value === d)?.short}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditForm(item)}
                      className="h-8 w-8 p-0 cursor-pointer"
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(item)}
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
              No category availability found.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total: <strong>{filtered.length}</strong>
            {search && ` (filtered from ${groupedList.length} total)`}
          </p>
        </div>
      </div>

      <CategoryAvailabilityForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editingItem}
      />

      {/* ── Delete Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category Availability?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-neutral-800">
                {deleteTarget ? getCategoryName(deleteTarget.category_id) : ""}
              </span>{" "}
              ke {deleteTarget?.items.length} availability entr
              {deleteTarget?.items.length === 1 ? "y" : "ies"} delete ho jaengi.
              Yeh action undo nahi ho sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletePending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeletePending && (
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

export default CategoryAvailabilityPage;
