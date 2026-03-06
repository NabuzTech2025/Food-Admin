import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/context/store/useAdminStore";
import { bulkSetInventory } from "@/api/inventory";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalItem {
    product_id: string;
    variant_id: string;
    qty_on_hand: string;
}

interface AddInventoryFormProps {
    open: boolean;
    onClose: () => void;
    products: any[];
}

// ─── Component ────────────────────────────────────────────────────────────────

function AddInventoryForm({ open, onClose, products }: AddInventoryFormProps) {
    const { store_id } = useAdminStore();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [modalItems, setModalItems] = useState<ModalItem[]>([
        { product_id: "", variant_id: "", qty_on_hand: "" },
    ]);

    useEffect(() => {
        if (open) {
            setModalItems([{ product_id: "", variant_id: "", qty_on_hand: "" }]);
        }
    }, [open]);

    const handleClose = () => {
        setModalItems([{ product_id: "", variant_id: "", qty_on_hand: "" }]);
        onClose();
    };

    const getSelectedProduct = (productId: string) =>
        (products || []).find((p) => p.id === parseInt(productId));

    const handleInputChange = (
        index: number,
        field: keyof ModalItem,
        value: string,
    ) => {
        const updated = [...modalItems];
        updated[index][field] = value;
        if (field === "product_id") updated[index].variant_id = "";
        setModalItems(updated);
    };

    const handleAddMore = () =>
        setModalItems([
            ...modalItems,
            { product_id: "", variant_id: "", qty_on_hand: "" },
        ]);

    const handleRemove = (index: number) =>
        setModalItems(modalItems.filter((_, i) => i !== index));

    const handleSave = async () => {
        // ── Validation ──
        for (let i = 0; i < modalItems.length; i++) {
            const item = modalItems[i];
            const product = getSelectedProduct(item.product_id);

            if (!item.product_id) {
                toast.error(`Item ${i + 1}: Product is required`);
                return;
            }
            if (!item.qty_on_hand || Number(item.qty_on_hand) < 0) {
                toast.error(`Item ${i + 1}: Valid quantity is required`);
                return;
            }
            const isVariable = product?.type?.toLowerCase() === "variable";
            if (isVariable && !item.variant_id) {
                toast.error(`Item ${i + 1}: Variant is required for variable product`);
                return;
            }
        }

        // ── Build payload ──
        const preparedItems: any[] = [];
        for (const item of modalItems) {
            const product = getSelectedProduct(item.product_id);
            const isVariable = product?.type?.toLowerCase() === "variable";

            if (isVariable) {
                const variantObj = product?.variants?.[parseInt(item.variant_id)];
                if (!variantObj?.id) {
                    toast.error(`Invalid variant selected for: ${product?.name}`);
                    return;
                }
                preparedItems.push({
                    variant_id: variantObj.id,
                    variant_name: variantObj.name || "",
                    qty_on_hand: Number(item.qty_on_hand),
                });
            } else {
                preparedItems.push({
                    product_id: Number(item.product_id),
                    qty_on_hand: Number(item.qty_on_hand),
                });
            }
        }

        const payload = { store_id: Number(store_id), items: preparedItems };

        try {
            setLoading(true);
            await bulkSetInventory(payload);
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            toast.success("Inventory added successfully");
            handleClose();
        } catch (err: any) {
            const data = err?.response?.data;
            const msg =
                typeof data === "string"
                    ? data
                    : data?.detail ||
                    data?.error ||
                    data?.message ||
                    "Failed to add inventory";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] rounded-xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">
                {/* Header */}
                <div className="flex-shrink-0 px-8 py-5 border-b bg-white rounded-t-xl">
                    <DialogTitle className="text-lg font-semibold">
                        Add Inventory
                    </DialogTitle>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                    {modalItems.map((item, index) => {
                        const selectedProduct = getSelectedProduct(item.product_id);
                        const showVariants =
                            selectedProduct?.type?.toLowerCase() === "variable" &&
                            selectedProduct?.variants?.length > 0;

                        return (
                            <div key={index}>
                                {/* Product + Variant row */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Product */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Product <span className="text-destructive">*</span>
                                        </label>
                                        <select
                                            className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={item.product_id}
                                            onChange={(e) =>
                                                handleInputChange(index, "product_id", e.target.value)
                                            }
                                        >
                                            <option value="">Select Product</option>
                                            {(products || []).map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Variant */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Variant{" "}
                                            {showVariants && (
                                                <span className="text-destructive">*</span>
                                            )}
                                        </label>
                                        <select
                                            className="w-full h-10 px-3 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                            value={item.variant_id}
                                            onChange={(e) =>
                                                handleInputChange(index, "variant_id", e.target.value)
                                            }
                                            disabled={!item.product_id || !showVariants}
                                        >
                                            <option value="">
                                                {!item.product_id
                                                    ? "Select Product First"
                                                    : !showVariants
                                                        ? "No Variant (Simple)"
                                                        : "Select Variant"}
                                            </option>
                                            {showVariants &&
                                                selectedProduct.variants.map(
                                                    (variant: any, idx: number) => (
                                                        <option key={idx} value={idx}>
                                                            {variant.id}
                                                            {variant.price ? ` - €${variant.price}` : ""}
                                                        </option>
                                                    ),
                                                )}
                                        </select>
                                    </div>
                                </div>

                                {/* Qty + Add/Remove row */}
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-neutral-700">
                                            Qty On Hand <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="Enter quantity"
                                            min={0}
                                            value={item.qty_on_hand}
                                            onChange={(e) =>
                                                handleInputChange(index, "qty_on_hand", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        {index === modalItems.length - 1 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddMore}
                                                className="flex items-center gap-1 h-10"
                                            >
                                                <Plus size={14} /> Add More
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => handleRemove(index)}
                                                className="flex items-center gap-1 h-10"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {index < modalItems.length - 1 && (
                                    <hr className="mt-5 border-border" />
                                )}
                            </div>
                        );
                    })}
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
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full sm:w-36 h-10"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-1" size={16} />
                                Saving...
                            </>
                        ) : (
                            "Add Items"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AddInventoryForm;
