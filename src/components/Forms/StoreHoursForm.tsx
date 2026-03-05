// src/components/Forms/StoreHoursForm.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddStoreHour, useDeleteStoreHour } from "@/hooks/useStoreSettings";
import type { GroupedStoreHour } from "@/api/storeSettings";

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

interface FormData {
  name: string;
  opening_time: string;
  closing_time: string;
}

interface StoreHoursFormProps {
  open: boolean;
  onClose: () => void;
  editData?: GroupedStoreHour | null;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function StoreHoursForm({ open, onClose, editData }: StoreHoursFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const { mutateAsync: addHour, isPending: isAdding } = useAddStoreHour();
  const { mutateAsync: deleteHour, isPending: isDeleting } =
    useDeleteStoreHour();
  const isLoading = isAdding || isDeleting;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          name: editData.name,
          opening_time: editData.opening_time?.slice(0, 5) ?? "",
          closing_time: editData.closing_time?.slice(0, 5) ?? "",
        });
        setSelectedDays([...editData.days]);
      } else {
        reset({ name: "", opening_time: "", closing_time: "" });
        setSelectedDays([]);
      }
    }
  }, [open, editData]);

  const handleClose = () => {
    reset({ name: "", opening_time: "", closing_time: "" });
    setSelectedDays([]);
    onClose();
  };

  const toggleDay = (value: number) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  const toggleAllDays = () => {
    setSelectedDays((prev) =>
      prev.length === DAYS_OF_WEEK.length
        ? []
        : DAYS_OF_WEEK.map((d) => d.value),
    );
  };

  const onSubmit = async (data: FormData) => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    try {
      // Edit: delete old entries first
      if (isEditMode && editData) {
        await Promise.all(editData.ids.map((id) => deleteHour(id)));
      }

      // Add new entries for each selected day
      await Promise.all(
        selectedDays.map((day) =>
          addHour({
            store_id: store_id!,
            payload: {
              name: data.name,
              day_of_week: day,
              opening_time: data.opening_time,
              closing_time: data.closing_time,
              store_id: Number(store_id),
            },
          }),
        ),
      );

      toast.success(
        isEditMode
          ? "Store hours updated successfully"
          : "Store hours added successfully",
      );
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const allSelected = selectedDays.length === DAYS_OF_WEEK.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit Store Hours" : "Add Store Hours"}
          </DialogTitle>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-base font-semibold text-neutral-700">
                TimeZone Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Morning, Evening"
                {...register("name", { required: "Title is required" })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-base font-semibold text-neutral-700">
                  Opening Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("opening_time", {
                    required: "Opening time is required",
                  })}
                />
                <FieldError message={errors.opening_time?.message} />
              </div>
              <div className="space-y-1.5">
                <label className="text-base font-semibold text-neutral-700">
                  Closing Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("closing_time", {
                    required: "Closing time is required",
                  })}
                />
                <FieldError message={errors.closing_time?.message} />
              </div>
            </div>

            {/* Day Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-neutral-700">
                  Select Days <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={toggleAllDays}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  {allSelected ? "Deselect All" : "Select All"}
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
                      className={`w-14 h-14 rounded-full text-sm font-bold border-2 transition-all cursor-pointer ${
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
                <p className="text-sm text-neutral-500">
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
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-36 h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-1" size={16} />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default StoreHoursForm;
