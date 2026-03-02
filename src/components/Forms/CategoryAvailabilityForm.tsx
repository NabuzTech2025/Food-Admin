// src/components/Forms/CategoryAvailabilityForm.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useCreateBulkCategoryAvailabilities,
  useDeleteCategoryAvailability,
} from "@/hooks/useCategoryAvailability";
import { useGetCategory } from "@/hooks/useCategory";
import SearchableSelect from "@/components/SearchableSelect";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryAvailabilityFormProps {
  open: boolean;
  onClose: () => void;
  editData?: GroupedAvailability | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

function CategoryAvailabilityForm({
  open,
  onClose,
  editData,
}: CategoryAvailabilityFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  // ── Form State ──
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isActive, setIsActive] = useState(true);

  // ── Data ──
  const { data: categoriesData } = useGetCategory(store_id);
  const categoryList = Array.isArray(categoriesData)
    ? categoriesData
    : ((categoriesData as any)?.data ?? []);

  // ── Mutations ──
  const { mutateAsync: createBulk, isPending: isCreating } =
    useCreateBulkCategoryAvailabilities();
  const { mutateAsync: deleteItem, isPending: isDeleting } =
    useDeleteCategoryAvailability();
  const isLoading = isCreating || isDeleting;

  // ── Populate on edit ──
  useEffect(() => {
    if (open) {
      if (editData) {
        const cat = categoryList.find(
          (c: any) => c.id === editData.category_id,
        );
        setSelectedCategories(cat ? [cat] : []);
        setSelectedDays(editData.days);
        setStartTime(editData.start_time?.slice(0, 5) ?? "");
        setEndTime(editData.end_time?.slice(0, 5) ?? "");
        setIsActive(editData.isActive);
      } else {
        setSelectedCategories([]);
        setSelectedDays([]);
        setStartTime("");
        setEndTime("");
        setIsActive(true);
      }
    }
  }, [open, editData]);

  const handleClose = () => {
    setSelectedCategories([]);
    setSelectedDays([]);
    setStartTime("");
    setEndTime("");
    setIsActive(true);
    onClose();
  };

  // ── Category selection ──
  const handleCategoryAdd = (id: string | number | undefined) => {
    if (!id) return;
    const cat = categoryList.find((c: any) => c.id === Number(id));
    if (!cat) return;
    setSelectedCategories((prev) => {
      if (prev.find((c) => c.id === cat.id)) return prev;
      return [...prev, cat];
    });
  };

  const handleCategoryRemove = (id: number) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Day selection ──
  const toggleDay = (value: number) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  const toggleAllDays = () => {
    if (selectedDays.length === DAYS_OF_WEEK.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(DAYS_OF_WEEK.map((d) => d.value));
    }
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }
    if (!startTime) {
      toast.error("Please set opening time");
      return;
    }
    if (!endTime) {
      toast.error("Please set closing time");
      return;
    }

    const formatTime = (t: string) => `${t}:00.000000`;

    try {
      // Edit: delete all old items first
      if (isEditMode && editData) {
        for (const item of editData.items) {
          await deleteItem(item.id);
        }
      }

      // Build bulk payload
      const payload: any[] = [];
      selectedCategories.forEach((cat) => {
        selectedDays.forEach((day) => {
          payload.push({
            category_id: cat.id,
            day_of_week: day,
            start_time: formatTime(startTime),
            end_time: formatTime(endTime),
            label: "Auto Generated",
            isActive,
          });
        });
      });

      await createBulk(payload);
      toast.success(
        isEditMode
          ? "Category availability updated successfully"
          : `${payload.length} availability entries added successfully`,
      );
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const allDaysSelected = selectedDays.length === DAYS_OF_WEEK.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode
              ? "Edit Category Availability"
              : "Add Category Availability"}
          </DialogTitle>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* ── Category Select ── */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">
                Select Categories <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                label=""
                options={categoryList}
                value={undefined}
                onChange={handleCategoryAdd}
                placeholder={
                  isEditMode
                    ? "Click to change category..."
                    : "Click to add categories..."
                }
              />

              {/* Selected Categories Tags */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full"
                    >
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleCategoryRemove(cat.id)}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Time Fields ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Opening Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">
                  Closing Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* ── Day Selection ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-700">
                  Select Days <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={toggleAllDays}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  {allDaysSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      title={day.name}
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-neutral-500 border-neutral-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>

              {selectedDays.length > 0 && (
                <p className="text-xs text-neutral-500">
                  {selectedDays.length} day{selectedDays.length > 1 ? "s" : ""}{" "}
                  selected:{" "}
                  {selectedDays
                    .sort((a, b) => a - b)
                    .map(
                      (d) => DAYS_OF_WEEK.find((day) => day.value === d)?.name,
                    )
                    .join(", ")}
                </p>
              )}
            </div>

            {/* ── Active Toggle ── */}
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                id="isActive"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-neutral-700 cursor-pointer"
              >
                Active
              </label>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 px-8 py-5 border-t bg-white rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-32 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedCategories.length === 0}
              className="w-full sm:w-auto h-10 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-1" size={16} />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update"
              ) : (
                `Add (${selectedCategories.length * selectedDays.length} entries)`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryAvailabilityForm;
