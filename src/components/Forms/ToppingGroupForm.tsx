// src/components/Forms/ToppingGroupForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useAddToppingGroup,
  useUpdateToppingGroup,
} from "@/hooks/useToppingGroup";
import type { ToppingGroup } from "@/api/toppingsGroup";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToppingGroupFormData {
  name: string;
  min_select: string;
  max_select: string;
  is_required: boolean;
}

interface ToppingGroupFormProps {
  open: boolean;
  onClose: () => void;
  editData?: ToppingGroup | null;
}

const DEFAULT_VALUES: ToppingGroupFormData = {
  name: "",
  min_select: "0",
  max_select: "0",
  is_required: true,
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function ToppingGroupForm({ open, onClose, editData }: ToppingGroupFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addGroup, isPending: isAdding } = useAddToppingGroup();
  const { mutateAsync: updateGroup, isPending: isUpdating } =
    useUpdateToppingGroup();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ToppingGroupFormData>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const isRequired = watch("is_required");

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? {
              name: editData.name,
              min_select: String(editData.min_select ?? 0),
              max_select: String(editData.max_select ?? 0),
              is_required: editData.is_required ?? true,
            }
          : DEFAULT_VALUES,
      );
    }
  }, [editData, open]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (data: ToppingGroupFormData) => {
    const payload = {
      name: data.name,
      min_select: parseInt(data.min_select) || 0,
      max_select: parseInt(data.max_select) || 0,
      is_required: data.is_required,
      store_id: store_id!,
    };
    try {
      if (isEditMode) {
        await updateGroup({ id: editData!.id, payload });
        toast.success("Topping group updated successfully");
      } else {
        await addGroup(payload);
        toast.success("Topping group added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit Topping Group" : "Add New Topping Group"}
          </DialogTitle>
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Sauces"
                {...register("name", { required: "Name is required" })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Min & Max Select */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Min Select</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("min_select")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Select</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("max_select")}
                />
              </div>
            </div>

            {/* Is Required Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Required</p>
                <p className="text-xs text-neutral-500">
                  Customer must select from this group
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue("is_required", !isRequired)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isRequired ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isRequired ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 px-6 py-4 border-t bg-white rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-1" size={16} />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update Group"
              ) : (
                "Save Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ToppingGroupForm;
