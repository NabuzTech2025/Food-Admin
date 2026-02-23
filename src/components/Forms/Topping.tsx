// src/components/Forms/ToppingForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddTopping, useUpdateTopping } from "@/hooks/useTopping";
import { currentCurrency } from "@/utils/helper/currency_type";
import type { Topping } from "@/api/topping";

interface ToppingFormData {
  name: string;
  description: string;
  price: string;
}

interface ToppingFormProps {
  open: boolean;
  onClose: () => void;
  editData?: Topping | null;
}

const DEFAULT_VALUES: ToppingFormData = { name: "", description: "", price: "" };

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

function ToppingForm({ open, onClose, editData }: ToppingFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addTopping, isPending: isAdding } = useAddTopping();
  const { mutateAsync: updateTopping, isPending: isUpdating } = useUpdateTopping();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToppingFormData>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? {
              name: editData.name,
              description: editData.description ?? "",
              price: String(editData.price ?? ""),
            }
          : DEFAULT_VALUES,
      );
    }
  }, [editData, open]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (data: ToppingFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      store_id: store_id!,
    };
    try {
      if (isEditMode) {
        await updateTopping({ id: editData!.id, payload });
        toast.success("Topping updated successfully");
      } else {
        await addTopping(payload);
        toast.success("Topping added successfully");
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
            {isEditMode ? "Edit Topping" : "Add New Topping"}
          </DialogTitle>
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Extra Cheese"
                {...register("name", { required: "Name is required" })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Price <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  {currentCurrency.symbol}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  {...register("price", { required: "Price is required" })}
                />
              </div>
              <FieldError message={errors.price?.message} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter description (optional)"
                rows={3}
                {...register("description")}
              />
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
                "Update Topping"
              ) : (
                "Save Topping"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ToppingForm;