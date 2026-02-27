// src/components/Forms/ItemAllergyForm.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useAddAllergyToProduct,
  useRemoveAllergyFromProduct,
} from "@/hooks/useItemAllergy";
import { useGetAllergy } from "@/hooks/useAllergy";
import { useGetProduct } from "@/hooks/useProduct";
import SearchableSelect from "@/components/SearchableSelect";
import type { AllergyProductLink } from "@/api/itemAllergy";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemAllergyFormProps {
  open: boolean;
  onClose: () => void;
  editData?: AllergyProductLink | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ItemAllergyForm({ open, onClose, editData }: ItemAllergyFormProps) {
  const isEditMode = !!editData;
  const { store_id } = useAdminStore();

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [selectedAllergyId, setSelectedAllergyId] = useState<number | null>(
    null,
  );

  // ── Data ──
  const { data: products } = useGetProduct(store_id);
  const { data: allergies } = useGetAllergy(store_id);

  const productList = Array.isArray(products)
    ? products
    : ((products as any)?.data ?? []);
  const allergyList = Array.isArray(allergies) ? allergies : [];

  // ── Mutations ──
  const { mutateAsync: addLink, isPending: isAdding } =
    useAddAllergyToProduct();
  const { mutateAsync: removeLink, isPending: isRemoving } =
    useRemoveAllergyFromProduct();
  const isLoading = isAdding || isRemoving;

  // ── Populate on edit ──
  useEffect(() => {
    if (open) {
      if (editData) {
        setSelectedProductId(editData.product_id);
        setSelectedAllergyId(editData.allergy_id);
      } else {
        setSelectedProductId(null);
        setSelectedAllergyId(null);
      }
    }
  }, [open, editData]);

  const handleClose = () => {
    setSelectedProductId(null);
    setSelectedAllergyId(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    if (!selectedAllergyId) {
      toast.error("Please select an allergy");
      return;
    }

    try {
      if (isEditMode && editData) {
        // Edit: remove old → add new
        const sameProduct = editData.product_id === selectedProductId;
        const sameAllergy = editData.allergy_id === selectedAllergyId;

        if (sameProduct && sameAllergy) {
          toast.info("No changes made");
          handleClose();
          return;
        }

        await removeLink({
          product_id: editData.product_id,
          allergy_id: editData.allergy_id,
        });
        await addLink({
          product_id: selectedProductId,
          allergy_id: selectedAllergyId,
        });
        toast.success("Item Allergy updated successfully");
      } else {
        await addLink({
          product_id: selectedProductId,
          allergy_id: selectedAllergyId,
        });
        toast.success("Item Allergy added successfully");
      }
      handleClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Something went wrong",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit Product Allergy" : "Add Product Allergy"}
          </DialogTitle>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
            {/* Product Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">
                Product <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                label=""
                options={productList}
                value={selectedProductId ?? undefined}
                onChange={(val) =>
                  setSelectedProductId(val ? Number(val) : null)
                }
                placeholder="Select Product"
              />
            </div>

            {/* Allergy Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">
                Allergy <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                label=""
                options={allergyList}
                value={selectedAllergyId ?? undefined}
                onChange={(val) =>
                  setSelectedAllergyId(val ? Number(val) : null)
                }
                placeholder="Select Allergy"
              />
            </div>
          </div>

          {/* Sticky Footer */}
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
              className="w-full sm:w-32 h-10"
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

export default ItemAllergyForm;
