// src/components/Forms/GroupItemForm.tsx
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddGroupItem, useUpdateGroupItem } from "@/hooks/useGroupItem";
import { useGetTopping } from "@/hooks/useTopping";
import { useGetToppingGroup } from "@/hooks/useToppingGroup";
import SearchableSelect from "@/components/SearchableSelect";
import type { GroupItem } from "@/api/groupitem";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupItemFormData {
  topping_id: string;
  topping_group_id: string;
  display_order: string;
}

interface GroupItemFormProps {
  open: boolean;
  onClose: () => void;
  editData?: GroupItem | null;
}

const DEFAULT_VALUES: GroupItemFormData = {
  topping_id: "",
  topping_group_id: "",
  display_order: "0",
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function GroupItemForm({ open, onClose, editData }: GroupItemFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addItem, isPending: isAdding } = useAddGroupItem();
  const { mutateAsync: updateItem, isPending: isUpdating } =
    useUpdateGroupItem();
  const isLoading = isAdding || isUpdating;

  // ── Dropdown data ──
  const { data: toppings } = useGetTopping(store_id);
  const { data: groups } = useGetToppingGroup(store_id);

  const toppingOptions = (Array.isArray(toppings) ? toppings : [])
    .filter((t) => t.isActive)
    .map((t) => ({ id: t.id, name: t.name }));

  const groupOptions = (Array.isArray(groups) ? groups : [])
    .filter((g) => g.isActive)
    .map((g) => ({ id: g.id, name: g.name }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GroupItemFormData>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? {
              topping_id: String(
                editData.topping?.id ?? editData.topping_id ?? "",
              ),
              topping_group_id: String(
                editData.group?.id ?? editData.topping_group_id ?? "",
              ),
              display_order: String(editData.display_order ?? 0),
            }
          : DEFAULT_VALUES,
      );
    }
  }, [editData, open]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (data: GroupItemFormData) => {
    const payload = {
      topping_id: parseInt(data.topping_id),
      topping_group_id: parseInt(data.topping_group_id),
      display_order: parseInt(data.display_order) || 0,
    };

    try {
      if (isEditMode) {
        await updateItem({ id: editData!.id, payload });
        toast.success("Group item updated successfully");
      } else {
        await addItem(payload);
        toast.success("Group item added successfully");
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
            {isEditMode ? "Edit Group Item" : "Add New Group Item"}
          </DialogTitle>
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Group Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Group <span className="text-destructive">*</span>
              </label>
              <Controller
                name="topping_group_id"
                control={control}
                rules={{ required: "Group is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    label=""
                    options={groupOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Group"
                  />
                )}
              />
              <FieldError message={errors.topping_group_id?.message} />
            </div>

            {/* Topping Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Topping <span className="text-destructive">*</span>
              </label>
              <Controller
                name="topping_id"
                control={control}
                rules={{ required: "Topping is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    label=""
                    options={toppingOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Topping"
                  />
                )}
              />
              <FieldError message={errors.topping_id?.message} />
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                {...register("display_order")}
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
                "Update Item"
              ) : (
                "Save Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GroupItemForm;
