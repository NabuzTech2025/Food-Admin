// src/components/Forms/ProductGroupForm.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useAddProductGroup,
  useUpdateProductGroup,
  useAddProductVariantGroup,
  useUpdateProductVariantGroup,
} from "@/hooks/useProductGroup";
import { useGetProduct } from "@/hooks/useProduct";
import { useGetToppingGroup } from "@/hooks/useToppingGroup";
import SearchableSelect from "@/components/SearchableSelect";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "product" | "variant";

interface EditTarget {
  item: any;
  mode: ViewMode;
}

interface ProductGroupFormProps {
  open: boolean;
  onClose: () => void;
  editTarget?: EditTarget | null;
  defaultMode?: ViewMode;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ProductGroupForm({
  open,
  onClose,
  editTarget,
  defaultMode = "product",
}: ProductGroupFormProps) {
  const isEditMode = !!editTarget;
  const mode = editTarget?.mode ?? defaultMode;
  const { store_id } = useAdminStore();

  // ── Form state ──
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // ── Data ──
  const { data: products } = useGetProduct(store_id);
  const { data: toppingGroups } = useGetToppingGroup(store_id);

  const productList = Array.isArray(products)
    ? products
    : ((products as any)?.data ?? []);
  const groupList = (Array.isArray(toppingGroups) ? toppingGroups : []).filter(
    (g: any) => g.isActive,
  );

  // ── Filter products based on mode ──
  // type check hataaya — sirf variants array dekho
  const simpleProducts = productList.filter(
    (p: any) => !p.variants || p.variants.length === 0,
  );
  const variableProducts = productList.filter(
    (p: any) => p.variants && p.variants.length > 0,
  );

  // ── Variants of selected product ──
  // type check nahi — sirf variants array check karo
  const hasVariants =
    selectedProduct?.variants && selectedProduct.variants.length > 0;
  const variantOptions = hasVariants ? selectedProduct.variants : [];

  // ── Mutations ──
  const { mutateAsync: addPG, isPending: isAddingPG } = useAddProductGroup();
  const { mutateAsync: updatePG, isPending: isUpdatingPG } =
    useUpdateProductGroup();
  const { mutateAsync: addVG, isPending: isAddingVG } =
    useAddProductVariantGroup();
  const { mutateAsync: updateVG, isPending: isUpdatingVG } =
    useUpdateProductVariantGroup();

  const isLoading = isAddingPG || isUpdatingPG || isAddingVG || isUpdatingVG;

  // ── Populate on edit ──
  useEffect(() => {
    if (open) {
      if (editTarget) {
        const item = editTarget.item;
        if (editTarget.mode === "product") {
          setSelectedProductId(item.product?.id ?? null);
          setSelectedGroupId(item.group?.id ?? null);
          const prod = productList.find((p: any) => p.id === item.product?.id);
          setSelectedProduct(prod ?? null);
        } else {
          setSelectedProductId(item.originalProductId ?? null);
          setSelectedVariantId(item.variantId ?? null);
          setSelectedGroupId(item.groupId ?? null);
          const prod = productList.find(
            (p: any) => p.id === item.originalProductId,
          );
          setSelectedProduct(prod ?? null);
        }
      } else {
        // Reset
        setSelectedProductId(null);
        setSelectedVariantId(null);
        setSelectedGroupId(null);
        setSelectedProduct(null);
      }
    }
  }, [open, editTarget]);

  const handleProductChange = (id: string | number | undefined) => {
    const idNum = id ? Number(id) : null;
    setSelectedProductId(idNum);
    setSelectedVariantId(null);
    const prod = productList.find((p: any) => p.id === idNum);
    setSelectedProduct(prod ?? null);
    console.log("Selected product:", prod);
    console.log("Variants:", prod?.variants);
  };

  const handleClose = () => {
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setSelectedGroupId(null);
    setSelectedProduct(null);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log(
      "handleSubmit called! mode:",
      mode,
      "variantId:",
      selectedVariantId,
      "groupId:",
      selectedGroupId,
    );

    // Validation
    if (!selectedGroupId) {
      toast.error("Please select a group");
      return;
    }
    if (mode === "product" && !selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    if (mode === "variant" && !selectedVariantId) {
      toast.error("Please select a variant");
      return;
    }
    console.log(
      "Submitting payload - variantId:",
      selectedVariantId,
      "groupId:",
      selectedGroupId,
    );

    const payload: any = {
      topping_group_id: selectedGroupId!,
      product_id: mode === "variant" ? selectedVariantId! : selectedProductId!
    };

    try {
      if (isEditMode) {
        if (mode === "variant") {
          await updateVG({ id: editTarget!.item.id, payload });
        } else {
          await updatePG({ id: editTarget!.item.id, payload });
        }
        toast.success(
          `${mode === "product" ? "Product" : "Variant"} group updated successfully`,
        );
      } else {
        if (mode === "variant") {
          await addVG(payload);
        } else {
          await addPG(payload);
        }
        toast.success(
          `${mode === "product" ? "Product" : "Variant"} group added successfully`,
        );
      }
      handleClose();
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      let errMsg = err?.response?.data?.message || "Something went wrong";
      if (typeof detail === "string") {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((d: any) => d.msg).join(", ");
      }
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-base font-semibold">
            {isEditMode
              ? `Edit ${mode === "product" ? "Product" : "Variant"} Group`
              : `Add ${mode === "product" ? "Product" : "Variant"} Group`}
          </DialogTitle>
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Product Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Product <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                label=""
                options={mode === "product" ? simpleProducts : variableProducts}
                value={selectedProductId ?? undefined}
                onChange={handleProductChange}
                placeholder={
                  mode === "product"
                    ? "Select Simple Product"
                    : "Select Variable Product"
                }
              />
            </div>

            {/* Variant Dropdown — sirf variant mode mein dikhega */}
            {mode === "variant" &&
              selectedProductId &&
              (hasVariants ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Variant <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    label=""
                    options={variantOptions}
                    value={selectedVariantId ?? undefined}
                    onChange={(val) => {
                      const num = val ? Number(val) : null;
                      console.log("Variant selected val:", num);
                      setSelectedVariantId(num);
                    }}
                    placeholder="Select Variant"
                  />
                </div>
              ) : (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2.5">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Is product mein koi variant nahi hai. Koi aur product
                    select karo.
                  </p>
                </div>
              ))}

            {/* Topping Group Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Topping Group <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                label=""
                options={groupList}
                value={selectedGroupId ?? undefined}
                onChange={(val) => setSelectedGroupId(val ? Number(val) : null)}
                placeholder="Select Topping Group"
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

export default ProductGroupForm;
