// src/components/Forms/AllergyForm.tsx
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useAddAllergy, useUpdateAllergy } from "@/hooks/useAllergy";
import type { Allergy } from "@/api/allergy";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllergyFormData {
  name: string;
  description: string;
}

interface AllergyFormProps {
  open: boolean;
  onClose: () => void;
  editData?: Allergy | null;
}

const DEFAULT_VALUES: AllergyFormData = {
  name: "",
  description: "",
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
  ],
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

// ─── Component ────────────────────────────────────────────────────────────────

function AllergyForm({ open, onClose, editData }: AllergyFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const { mutateAsync: addItem, isPending: isAdding } = useAddAllergy();
  const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateAllergy();
  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AllergyFormData>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? { name: editData.name, description: editData.description ?? "" }
          : DEFAULT_VALUES,
      );
    }
  }, [editData, open]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (data: AllergyFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      store_id: store_id!,
    };
    try {
      if (isEditMode) {
        await updateItem({ id: editData!.id, payload });
        toast.success("Allergy updated successfully");
      } else {
        await addItem(payload);
        toast.success("Allergy added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit Allergy" : "Add New Allergy"}
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
                Allergy Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Peanuts, Gluten, Dairy"
                {...register("name", { required: "Name is required" })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Description — ReactQuill */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="rounded-md border border-input overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write detailed description..."
                      modules={QUILL_MODULES}
                      style={{ minHeight: "150px" }}
                    />
                  </div>
                )}
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
                "Update Allergy"
              ) : (
                "Save Allergy"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AllergyForm;
