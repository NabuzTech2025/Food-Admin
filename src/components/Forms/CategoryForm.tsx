import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SearchableSelect from "@/components/SearchableSelect";
import { useAdminStore } from "@/context/store/useAdminStore";
import type { Category } from "@/api/category";
import { useGetTax } from "@/hooks/useTax";
import { useAddCategory, useUpdateCategory } from "@/hooks/useCategory";
import { useUploadImage } from "@/hooks/Common/useUploadImage";

interface CategoryFormData {
  name: string;
  description: string;
  display_order: string;
  tax_id: number | string | undefined;
  isActive: string;
}

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  existingCategories: Category[];
  // ✅ If editData is provided → Edit mode, otherwise → Add mode
  editData?: Category | null;
}

function CategoryForm({
  open,
  onClose,
  existingCategories,
  editData,
}: CategoryFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: taxList = [] } = useGetTax(store_id);
  const { mutateAsync: addCategory, isPending: isAdding } = useAddCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateCategory();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    mode: "onBlur",
  });

  // ✅ Populate form when editData changes
  useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        description: editData.description ?? "",
        display_order:
          editData.display_order != null ? String(editData.display_order) : "",
        tax_id: editData.tax?.id ?? undefined,
        isActive: String(editData.isActive),
      });
      setImagePreview(
        editData.image_url ? editData.image_url.split("?")[0] : "",
      );
    } else {
      reset({
        name: "",
        description: "",
        display_order: "",
        tax_id: undefined,
        isActive: "true",
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [editData, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleClose = () => {
    reset();
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  const onSubmit = async (data: CategoryFormData) => {
    // Duplicate display order check (skip current item in edit mode)
    if (data.display_order) {
      const isDuplicate = existingCategories.some(
        (cat) =>
          cat.display_order === parseInt(data.display_order) &&
          cat.id !== editData?.id, // ✅ skip self in edit mode
      );
      if (isDuplicate) {
        toast.warning("Display order already exists!");
        return;
      }
    }

    // Upload new image if selected
    let imageUrl = imagePreview; // default: keep existing image
    if (imageFile) {
      try {
        const res = await uploadImage({ file: imageFile });
        imageUrl = res.url || res.image_url || "";
      } catch {
        return; // error already toasted in hook
      }
    }

    const payload = {
      name: data.name,
      store_id: store_id!,
      tax_id: data.tax_id ?? null,
      image_url: imageUrl,
      description: data.description,
      display_order: data.display_order ? parseInt(data.display_order) : null,
      isActive: data.isActive === "true",
    };

    try {
      if (isEditMode) {
        await updateCategory({ id: editData!.id, payload });
        toast.success("Category updated successfully");
      } else {
        await addCategory(payload);
        toast.success("Category added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const isLoading = isAdding || isUpdating || isUploading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-4 sm:mx-auto rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditMode ? "Edit Category" : "Add New Category"}
            </DialogTitle>

            {/* Image upload */}
            <div className="mr-6">
              {imagePreview ? (
                <div className="relative w-12 h-12">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-white rounded-full shadow text-destructive"
                  >
                    <X size={16} />
                  </button>
                  <label
                    htmlFor="category-image"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    <input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="category-image"
                  className="flex items-center gap-1 text-xs text-neutral-500 border border-dashed border-neutral-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus size={16} />
                  Image
                  <input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Category Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Tandoori"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name", { required: "Category name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Tax */}
          <Controller
            name="tax_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Tax"
                placeholder="Select Tax (optional)"
                options={taxList}
                value={field.value}
                onChange={field.onChange}
                getOptionLabel={(opt: any) =>
                  `${opt.name} (${opt.percentage}%)`
                }
                getOptionValue={(opt: any) => opt.id}
                clearable
              />
            )}
          />

          {/* Display Order */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display Order</label>
            <Input
              type="number"
              placeholder="e.g. 1"
              min="0"
              {...register("display_order")}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter description (optional)"
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              {...register("isActive")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
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
                  {isUploading
                    ? "Uploading..."
                    : isEditMode
                      ? "Updating..."
                      : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update Category"
              ) : (
                "Save Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryForm;
