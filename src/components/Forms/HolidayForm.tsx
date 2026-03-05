// src/components/Forms/HolidayForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddHoliday, useUpdateHoliday } from "@/hooks/useStoreSettings";
import type { Holiday } from "@/api/storeSettings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  date: string;
  time: string;
}

interface HolidayFormProps {
  open: boolean;
  onClose: () => void;
  editData?: Holiday | null;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function HolidayForm({ open, onClose, editData }: HolidayFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addItem, isPending: isAdding } = useAddHoliday();
  const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateHoliday();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  useEffect(() => {
    if (open) {
      if (editData?.date) {
        const [dateStr, timeStr] = editData.date.includes("T")
          ? editData.date.split("T")
          : [editData.date, ""];
        reset({
          name: editData.name,
          date: dateStr,
          time: timeStr.substring(0, 5),
        });
      } else {
        reset({ name: "", date: "", time: "" });
      }
    }
  }, [open, editData]);

  const handleClose = () => {
    reset({ name: "", date: "", time: "" });
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      date: `${data.date}T${data.time}:00`,
      store_id: Number(store_id),
    };
    try {
      if (isEditMode) {
        await updateItem({ id: editData!.id, payload });
        toast.success("Holiday updated successfully");
      } else {
        await addItem(payload);
        toast.success("Holiday added successfully");
      }
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
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit Holiday" : "Add Holiday"}
          </DialogTitle>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Holiday Title */}
            <div className="space-y-1.5">
              <label className="text-base font-semibold text-neutral-700">
                Holiday Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Christmas, New Year"
                {...register("name", {
                  required: "Holiday title is required",
                  minLength: {
                    value: 2,
                    message: "Title must be at least 2 characters",
                  },
                })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-base font-semibold text-neutral-700">
                  Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("date", { required: "Date is required" })}
                />
                <FieldError message={errors.date?.message} />
              </div>
              <div className="space-y-1.5">
                <label className="text-base font-semibold text-neutral-700">
                  Time <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("time", { required: "Time is required" })}
                />
                <FieldError message={errors.time?.message} />
              </div>
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
                "Update Holiday"
              ) : (
                "Save Holiday"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default HolidayForm;
