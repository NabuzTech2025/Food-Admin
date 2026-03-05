// src/pages/Admin/StoreSettings.tsx
import { useState, useMemo } from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useGetStoreHours,
  useDeleteStoreHour,
  useGetHolidays,
  useDeleteHoliday,
} from "@/hooks/useStoreSettings";
import StoreHoursForm from "@/components/Forms/StoreHoursForm";
import HolidayForm from "@/components/Forms/HolidayForm";
import { toast } from "sonner";
import type { GroupedStoreHour, Holiday } from "@/api/storeSettings";

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

type TabType = "timings" | "holidays";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (t: string) => t?.slice(0, 5) ?? "-";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB");
  } catch {
    return "-";
  }
};

const formatHolidayTime = (dateStr: string) => {
  if (!dateStr) return "-";
  return dateStr.includes("T") ? dateStr.split("T")[1]?.substring(0, 5) : "-";
};

// ─── Component ────────────────────────────────────────────────────────────────

function StoreSettingsPage() {
  const { store_id } = useAdminStore();

  const [tab, setTab] = useState<TabType>("timings");
  const [search, setSearch] = useState("");

  // ── Store Hours state ──
  const [hoursFormOpen, setHoursFormOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<GroupedStoreHour | null>(
    null,
  );
  const [deleteHoursTarget, setDeleteHoursTarget] =
    useState<GroupedStoreHour | null>(null);
  const [isDeletingHours, setIsDeletingHours] = useState(false);

  // ── Holiday state ──
  const [holidayFormOpen, setHolidayFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deleteHolidayTarget, setDeleteHolidayTarget] =
    useState<Holiday | null>(null);

  // ── Data ──
  const { data: storeHoursRaw, isLoading: isLoadingHours } =
    useGetStoreHours(store_id);
  const { data: holidaysRaw, isLoading: isLoadingHolidays } =
    useGetHolidays(store_id);
  const { mutateAsync: deleteHour } = useDeleteStoreHour();
  const { mutate: deleteHolidayItem, isPending: isDeletingHoliday } =
    useDeleteHoliday();

  // ── Group store hours ──
  const groupedHours = useMemo((): GroupedStoreHour[] => {
    const raw = Array.isArray(storeHoursRaw) ? storeHoursRaw : [];
    const grouped: Record<string, GroupedStoreHour> = {};
    raw.forEach((hour) => {
      const key = `${hour.name}-${hour.opening_time}-${hour.closing_time}`;
      if (!grouped[key]) {
        grouped[key] = {
          name: hour.name,
          opening_time: hour.opening_time,
          closing_time: hour.closing_time,
          days: [],
          ids: [],
        };
      }
      grouped[key].days.push(hour.day_of_week);
      grouped[key].ids.push(hour.id);
    });
    return Object.values(grouped);
  }, [storeHoursRaw]);

  const holidays = Array.isArray(holidaysRaw) ? holidaysRaw : [];

  // ── Search filter ──
  const filteredHours = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return groupedHours;
    return groupedHours.filter((h) => h.name.toLowerCase().includes(q));
  }, [groupedHours, search]);

  const filteredHolidays = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return holidays;
    return holidays.filter((h) => h.name.toLowerCase().includes(q));
  }, [holidays, search]);

  // ── Handlers ──
  const handleTabChange = (val: string) => {
    setTab(val as TabType);
    setSearch("");
  };

  // Store Hours
  const openAddHours = () => {
    setEditingHours(null);
    setHoursFormOpen(true);
  };
  const openEditHours = (item: GroupedStoreHour) => {
    setEditingHours(item);
    setHoursFormOpen(true);
  };

  const handleDeleteHours = async () => {
    if (!deleteHoursTarget) return;
    setIsDeletingHours(true);
    try {
      await Promise.all(deleteHoursTarget.ids.map((id) => deleteHour(id)));
      toast.success("Store hours deleted successfully");
      setDeleteHoursTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setIsDeletingHours(false);
    }
  };

  // Holidays
  const openAddHoliday = () => {
    setEditingHoliday(null);
    setHolidayFormOpen(true);
  };
  const openEditHoliday = (item: Holiday) => {
    setEditingHoliday(item);
    setHolidayFormOpen(true);
  };

  const handleDeleteHoliday = () => {
    if (!deleteHolidayTarget) return;
    deleteHolidayItem(deleteHolidayTarget.id, {
      onSuccess: () => {
        toast.success("Holiday deleted successfully");
        setDeleteHolidayTarget(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete");
        setDeleteHolidayTarget(null);
      },
    });
  };

  const isLoading = tab === "timings" ? isLoadingHours : isLoadingHolidays;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-80px)]">
        {/* ── Card Header ── */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Store Settings
            </h2>
            <Tabs value={tab} onValueChange={handleTabChange}>
              <TabsList className="h-9">
                <TabsTrigger
                  value="timings"
                  className="cursor-pointer px-5 text-sm"
                >
                  Store Timings
                </TabsTrigger>
                <TabsTrigger
                  value="holidays"
                  className="cursor-pointer px-5 text-sm"
                >
                  Holidays
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder={
                  tab === "timings" ? "Search timings..." : "Search holidays..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            <Button
              onClick={tab === "timings" ? openAddHours : openAddHoliday}
              className="flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* ── Store Timings Table ── */}
        {tab === "timings" && (
          <div className="hidden sm:flex flex-col flex-1 min-h-0">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 font-semibold text-neutral-700">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      TITLE
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
                      <TableCell colSpan={6} className="text-center py-10">
                        <Loader2
                          className="animate-spin mx-auto text-primary"
                          size={24}
                        />
                      </TableCell>
                    </TableRow>
                  ) : filteredHours.length > 0 ? (
                    filteredHours.map((item, index) => (
                      <TableRow
                        key={`${item.name}-${item.opening_time}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-neutral-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-800">
                          {item.name}
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
                        <TableCell className="font-medium text-neutral-700">
                          {formatTime(item.opening_time)}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-700">
                          {formatTime(item.closing_time)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditHours(item)}
                              className="flex items-center gap-1 h-8 cursor-pointer"
                            >
                              <Pencil size={13} /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteHoursTarget(item)}
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
                        colSpan={6}
                        className="text-center py-10 text-neutral-400"
                      >
                        No store timings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Holidays Table ── */}
        {tab === "holidays" && (
          <div className="hidden sm:flex flex-col flex-1 min-h-0">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 font-semibold text-neutral-700">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      HOLIDAY TITLE
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      DATE
                    </TableHead>
                    <TableHead className="font-semibold text-neutral-700">
                      TIME
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
                  ) : filteredHolidays.length > 0 ? (
                    filteredHolidays.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="text-neutral-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-800">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-neutral-700">
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell className="text-neutral-700">
                          {formatHolidayTime(item.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditHoliday(item)}
                              className="flex items-center gap-1 h-8 cursor-pointer"
                            >
                              <Pencil size={13} /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteHolidayTarget(item)}
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
                        No holidays found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Mobile Cards — Timings ── */}
        {tab === "timings" && (
          <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filteredHours.length > 0 ? (
              filteredHours.map((item) => (
                <div
                  key={`${item.name}-${item.opening_time}`}
                  className="px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatTime(item.opening_time)} –{" "}
                        {formatTime(item.closing_time)}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {item.days
                          .sort((a, b) => a - b)
                          .map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                            >
                              {
                                DAYS_OF_WEEK.find((day) => day.value === d)
                                  ?.short
                              }
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditHours(item)}
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteHoursTarget(item)}
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
                No store timings found.
              </div>
            )}
          </div>
        )}

        {/* ── Mobile Cards — Holidays ── */}
        {tab === "holidays" && (
          <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filteredHolidays.length > 0 ? (
              filteredHolidays.map((item) => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatDate(item.date)} at{" "}
                        {formatHolidayTime(item.date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditHoliday(item)}
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteHolidayTarget(item)}
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
                No holidays found.
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Total:{" "}
            <strong>
              {tab === "timings"
                ? filteredHours.length
                : filteredHolidays.length}
            </strong>
          </p>
        </div>
      </div>

      {/* ── Forms ── */}
      <StoreHoursForm
        open={hoursFormOpen}
        onClose={() => {
          setHoursFormOpen(false);
          setEditingHours(null);
        }}
        editData={editingHours}
      />
      <HolidayForm
        open={holidayFormOpen}
        onClose={() => {
          setHolidayFormOpen(false);
          setEditingHoliday(null);
        }}
        editData={editingHoliday}
      />

      {/* ── Delete Store Hours Dialog ── */}
      <AlertDialog
        open={!!deleteHoursTarget}
        onOpenChange={() => setDeleteHoursTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store Hours?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-neutral-800">
                {deleteHoursTarget?.name}
              </span>{" "}
              ke {deleteHoursTarget?.ids.length} entr
              {deleteHoursTarget?.ids.length === 1 ? "y" : "ies"} delete ho
              jaengi. Yeh action undo nahi ho sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHours}
              disabled={isDeletingHours}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeletingHours && (
                <Loader2 className="animate-spin mr-1" size={14} />
              )}{" "}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Holiday Dialog ── */}
      <AlertDialog
        open={!!deleteHolidayTarget}
        onOpenChange={() => setDeleteHolidayTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-neutral-800">
                {deleteHolidayTarget?.name}
              </span>{" "}
              holiday permanently delete ho jaegi. Yeh action undo nahi ho
              sakta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHoliday}
              disabled={isDeletingHoliday}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeletingHoliday && (
                <Loader2 className="animate-spin mr-1" size={14} />
              )}{" "}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StoreSettingsPage;
