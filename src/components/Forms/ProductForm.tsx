// src/components/Forms/ProductForm.tsx
import { useEffect, useState,  } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, ImagePlus, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SearchableSelect from "@/components/SearchableSelect";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useGetCategory } from "@/hooks/useCategory";
import { useGetTax } from "@/hooks/useTax";
import { useAddProduct, useUpdateProduct } from "@/hooks/useProduct";
import { useUploadImage } from "@/hooks/Common/useUploadImage";
import { currentCurrency } from "@/utils/helper/currency_type";
import type { Product, ProductPayload } from "@/api/product";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VariantField {
  name: string;
  price: string;
  discount_price: string;
  description: string;
}

interface ProductFormData {
  name: string;
  item_code: string;
  description: string;
  display_order: string;
  category_id: number | string | undefined;
  tax_id: number | string | undefined;
  type: "simple" | "variable";
  price: string;
  discount_price: string;
  isActive: string;
  variants: VariantField[];
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  existingProducts: Product[];
  editData?: Product | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_VARIANT: VariantField = {
  name: "",
  price: "",
  discount_price: "",
  description: "",
};

const DEFAULT_VALUES: ProductFormData = {
  name: "",
  item_code: "",
  description: "",
  display_order: "",
  category_id: undefined,
  tax_id: undefined,
  type: "simple",
  price: "",
  discount_price: "",
  isActive: "true",
  variants: [],
};

const SELECT_CLS =
  "w-full h-10 px-3 text-sm rounded-md border border-input bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary";

// ─── Small helpers ────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-0.5">{message}</p> : null;

const FormLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="text-sm font-medium">
    {children}
    {required && <span className="text-destructive ml-0.5">*</span>}
  </label>
);

// ─── Component ────────────────────────────────────────────────────────────────

function ProductForm({
  open,
  onClose,
  existingProducts,
  editData,
}: ProductFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: categoryList = [] } = useGetCategory(store_id);
  const { data: taxList = [] } = useGetTax(store_id);
  const { mutateAsync: addProduct, isPending: isAdding } = useAddProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const isLoading = isAdding || isUpdating || isUploading;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const selectedType = watch("type");

  // ── Populate / reset ──
  useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        item_code: editData.item_code ?? "",
        description: editData.description ?? "",
        display_order:
          editData.display_order != null ? String(editData.display_order) : "",
        category_id: editData.category_id ?? undefined,
        tax_id: editData.tax?.id ?? undefined,
        type: editData.type ?? "simple",
        price: editData.price != null ? String(editData.price) : "",
        discount_price:
          editData.discount_price > 0 ? String(editData.discount_price) : "",
        isActive: String(editData.isActive),
        variants:
          editData.type === "variable"
            ? (editData.variants ?? []).map((v) => ({
                name: v.name,
                price: String(v.price),
                discount_price:
                  v.discount_price > 0 ? String(v.discount_price) : "",
                description: v.description ?? "",
              }))
            : [],
      });
      setImagePreview(
        editData.image_url ? editData.image_url.split("?")[0] : "",
      );
    } else {
      reset(DEFAULT_VALUES);
      setImagePreview("");
    }
    setImageFile(null);
  }, [editData, open, reset]);

  // ── Image handlers ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  // ── Submit ──
  const onSubmit = async (data: ProductFormData) => {
    // 1. Check duplicate display_order
    if (data.display_order) {
      const isDuplicate = existingProducts.some(
        (p) =>
          p.display_order === parseInt(data.display_order) &&
          p.id !== editData?.id,
      );
      if (isDuplicate) {
        toast.warning("Display order already exists!");
        return;
      }
    }

    // 2. Upload image if new file present
    let imageUrl = imagePreview;
    if (imageFile) {
      try {
        const res = await uploadImage({ file: imageFile });
        imageUrl = res.url || res.image_url || "";
      } catch (err) {
        // Upload hook handles error toast typically, or we can catch here
        console.error("Image upload failed", err);
        return;
      }
    }

    // 3. Prepare payload
    // Ensure category_id is number or string, but never undefined/null if required
    if (!data.category_id && data.category_id !== 0) {
      toast.error("Category is required");
      return;
    }

    const payload: ProductPayload = {
      name: data.name,
      item_code: data.item_code,
      description: data.description,
      image_url: imageUrl,
      display_order: data.display_order ? parseInt(data.display_order) : null,
      isActive: data.isActive === "true",
      type: data.type,
      price: data.type === "simple" ? parseFloat(data.price) || 0 : 0,
      discount_price:
        data.type === "simple" && data.discount_price
          ? parseFloat(data.discount_price)
          : 0,
      store_id: store_id!,
      // Force non-null assertion or fallback because we checked above
      category_id: data.category_id!,
      tax_id: data.tax_id ?? null,
      variants:
        data.type === "variable"
          ? data.variants.map((v) => ({
              name: v.name,
              price: parseFloat(v.price) || 0,
              discount_price: v.discount_price
                ? parseFloat(v.discount_price)
                : 0,
              description: v.description,
            }))
          : [],
    };

    try {
      if (isEditMode && editData) {
        await updateProduct({ id: editData.id, payload });
        toast.success("Product updated successfully");
      } else {
        await addProduct(payload);
        toast.success("Product added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* 
        Ensure max-height and strict overflow constraints for sticky behavior.
        "flex flex-col" is critical. "overflow-hidden" prevents double scrollbars.
      */}
      <DialogContent className="sm:max-w-2xl w-[calc(100%-2rem)] h-[85vh] p-0 flex flex-col gap-0 overflow-hidden bg-background border rounded-xl shadow-lg">
        {/* ── HEADER (Sticky) ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>

          <div className="mr-8 sm:mr-6 relative">
            {/* Image upload widget */}
            {imagePreview ? (
              <div className="relative w-11 h-11 shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-11 h-11 rounded-full object-cover border-2 border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute -top-1 -right-1 bg-white rounded-full shadow text-destructive hover:bg-neutral-100 transition-colors"
                >
                  <X size={15} />
                </button>
                <label
                  htmlFor="product-image"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            ) : (
              <label
                htmlFor="product-image"
                className="flex items-center gap-1 text-xs text-neutral-500 border border-dashed border-neutral-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary hover:text-primary transition-colors shrink-0 whitespace-nowrap"
              >
                <ImagePlus size={15} />
                Image
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* ── BODY (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form
            id="product-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Row 1 — Name + Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel required>Product Name</FormLabel>
                <Input
                  placeholder="e.g. Chicken Burger"
                  {...register("name", {
                    required: "Product name is required",
                  })}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div className="space-y-1.5">
                <FormLabel required>Product Code</FormLabel>
                <Input
                  placeholder="e.g. SKU-001"
                  {...register("item_code", {
                    required: "Product code is required",
                  })}
                />
                <FieldError message={errors.item_code?.message} />
              </div>
            </div>

            {/* Row 2 — Category + Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="category_id"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <SearchableSelect
                      label="Category"
                      placeholder="Select Category"
                      options={categoryList}
                      value={field.value}
                      onChange={field.onChange}
                      getOptionLabel={(opt: any) => opt.name}
                      getOptionValue={(opt: any) => opt.id}
                    />
                    <FieldError message={errors.category_id?.message} />
                  </div>
                )}
              />

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
            </div>

            {/* Row 3 — Type + Display Order + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Type</FormLabel>
                <select className={SELECT_CLS} {...register("type")}>
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <FormLabel>Display Order</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  min="1"
                  {...register("display_order")}
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Status</FormLabel>
                <select className={SELECT_CLS} {...register("isActive")}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Row 4 — Price + Discount (simple only) */}
            {selectedType === "simple" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1.5">
                  <FormLabel required>Price</FormLabel>
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
                      {...register("price", {
                        required: "Price is required",
                      })}
                    />
                  </div>
                  <FieldError message={errors.price?.message} />
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Discount Price</FormLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                      {currentCurrency.symbol}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Optional"
                      className="pl-7"
                      {...register("discount_price")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Enter description (optional)"
                rows={3}
                {...register("description")}
              />
            </div>

            {/* Variants (variable only) */}
            {selectedType === "variable" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <FormLabel>Variants</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append(EMPTY_VARIANT)}
                    className="flex items-center gap-1 h-7 text-xs cursor-pointer"
                  >
                    <Plus size={12} />
                    Add Variant
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-4 border border-dashed rounded-lg bg-muted/10">
                    No variants added. Click "Add Variant" to start.
                  </p>
                )}

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-border rounded-lg p-3 space-y-3 bg-muted/20 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-600">
                          Variant {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive/80 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Name *</label>
                          <Input
                            placeholder="e.g. Small"
                            {...register(`variants.${index}.name`, {
                              required: "Required",
                            })}
                            className="h-8 text-xs"
                          />
                          <FieldError
                            message={errors.variants?.[index]?.name?.message}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium">
                            Description
                          </label>
                          <Input
                            placeholder="Optional"
                            {...register(`variants.${index}.description`)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium">Price *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                              {currentCurrency.symbol}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7 h-8 text-xs"
                              {...register(`variants.${index}.price`, {
                                required: "Required",
                              })}
                            />
                          </div>
                          <FieldError
                            message={errors.variants?.[index]?.price?.message}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium">
                            Discount Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                              {currentCurrency.symbol}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Optional"
                              className="pl-7 h-8 text-xs"
                              {...register(`variants.${index}.discount_price`)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── FOOTER (Sticky) ── */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 px-6 py-4 border-t border-border bg-background">
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
            form="product-form"
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
              "Update Product"
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductForm;
