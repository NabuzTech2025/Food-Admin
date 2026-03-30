// src/components/Forms/DeliveryTimePlanForm.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useBulkCreateDeliveryTimePlans,
  useDeleteDeliveryTimePlan,
} from "@/hooks/useDeliveryTimePlan";
import type { GroupedDeliveryTimePlan } from "@/api/deliveryTimePlan";

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

interface DeliveryTimePlanFormProps {
  open: boolean;
  onClose: () => void;
  editData?: GroupedDeliveryTimePlan | null;
}

function DeliveryTimePlanForm({
  open,
  onClose,
  editData,
}: DeliveryTimePlanFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: bulkCreate, isPending: isCreating } =
    useBulkCreateDeliveryTimePlans();
  const { mutateAsync: deleteItem, isPending: isDeleting } =
    useDeleteDeliveryTimePlan();
  const isLoading = isCreating || isDeleting;

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editData) {
        setStartTime(editData.start_time.slice(0, 5));
        setEndTime(editData.end_time.slice(0, 5));
        setSelectedDays([...editData.days]);
      } else {
        setStartTime("");
        setEndTime("");
        setSelectedDays([]);
      }
      setErrors({});
    }
  }, [open, editData]);

  const handleClose = () => {
    setStartTime("");
    setEndTime("");
    setSelectedDays([]);
    setErrors({});
    onClose();
  };

  const toggleDay = (val: number) =>
    setSelectedDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val],
    );

  const allSelected = selectedDays.length === 7;
  const toggleAll = () =>
    setSelectedDays(allSelected ? [] : DAYS_OF_WEEK.map((d) => d.value));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!startTime) e.startTime = "Opening time is required";
    if (!endTime) e.endTime = "Closing time is required";
    if (selectedDays.length === 0) e.days = "Select at least one day";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      // ── Edit: delete old entries first ──
      if (isEditMode && editData?.ids?.length) {
        await Promise.all(editData.ids.map((id) => deleteItem(id)));
      }

      // ── Build payload — name = day name automatically ──
      const payload = selectedDays.map((dayVal) => {
        const dayObj = DAYS_OF_WEEK.find((d) => d.value === dayVal)!;
        return {
          day_of_week: dayVal,
          start_time: `${startTime}:00`,
          end_time: `${endTime}:00`,
          store_id: Number(store_id),
          name: dayObj.name, // ✅ "Monday", "Tuesday"... automatically
        };
      });

      await bulkCreate({ store_id: Number(store_id), payload });
      toast.success(
        isEditMode
          ? "Delivery time updated successfully"
          : "Delivery time added successfully",
      );
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Edit Delivery Time" : "Add Delivery Time"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {/* Opening + Closing Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-base font-semibold text-neutral-700">
                Opening Time <span className="text-destructive">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-base font-semibold text-neutral-700">
                Closing Time <span className="text-destructive">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-base font-semibold text-neutral-700">
                Days <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const selected = selectedDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    title={day.name}
                    onClick={() => toggleDay(day.value)}
                    className={`w-14 h-14 rounded-full text-sm font-bold border-2 transition-all ${
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
                <span className="font-semibold">
                  {selectedDays.length} days selected:{" "}
                </span>
                {DAYS_OF_WEEK.filter((d) => selectedDays.includes(d.value))
                  .map((d) => d.name)
                  .join(", ")}
              </p>
            )}
            {errors.days && (
              <p className="text-xs text-destructive">{errors.days}</p>
            )}
          </div>
        </div>

        {/* Footer */}
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-36 h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-1" size={16} />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Add Time"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeliveryTimePlanForm;
