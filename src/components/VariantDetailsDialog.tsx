import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { currentCurrency } from "@/utils/helper/currency_type";
import type { Product } from "@/api/product";

interface VariantDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function VariantDetailsDialog({
    open,
    onClose,
    product,
}: VariantDetailsDialogProps) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 rounded-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold">Variants for {product.name}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto -mx-6 px-6">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="w-[40%]">Variant Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Discount Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {product.variants?.map((variant, index) => (
                                <TableRow key={index} className="hover:bg-muted/50 border-b last:border-0">
                                    <TableCell className="font-medium text-neutral-800">
                                        {variant.name}
                                        {variant.description && (
                                            <p className="text-xs text-neutral-500 font-normal mt-0.5">{variant.description}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {currentCurrency.symbol}
                                        {variant.price}
                                    </TableCell>
                                    <TableCell>
                                        {variant.discount_price > 0 ? (
                                            <span className="text-green-600 font-medium">
                                                {currentCurrency.symbol}
                                                {variant.discount_price}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!product.variants || product.variants.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-6 text-neutral-500">
                                        No variants available for this product.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
