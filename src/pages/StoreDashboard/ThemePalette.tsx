import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useGetStoreTheme, useSaveStoreTheme } from "@/hooks/useStoreTheme";
import {
  colorPalettes,
  type ColorPalette,
  type CouponColor,
} from "@/constants/themePalettes";

const Swatch = ({ label, value }: { label: string; value: string }) => (
  <div className="flex w-14 flex-col items-center gap-1.5">
    <div
      className="h-11 w-11 rounded-lg border shadow-sm ring-1 ring-black/5"
      style={{ backgroundColor: value }}
      title={`${label}: ${value}`}
    />
    <span className="text-center text-[10px] capitalize leading-tight text-muted-foreground">
      {label.replace("-", " ")}
    </span>
  </div>
);

const CouponChip = ({ label, c }: { label: string; c: CouponColor }) => (
  <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: c.bg }}>
    <p className="text-sm font-semibold" style={{ color: c.text }}>
      {label}
    </p>
    <p className="text-xs" style={{ color: c.subtext }}>
      Example coupon
    </p>
  </div>
);

const PaletteCard = ({
  palette,
  applied,
  applying,
  disabled,
  onSelect,
}: {
  palette: ColorPalette;
  applied: boolean;
  applying: boolean;
  disabled: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={cn(
      "flex flex-col gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed",
      applied
        ? "border-primary ring-2 ring-primary/30"
        : "border-border hover:border-muted-foreground/40",
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{palette.name}</h3>
          {palette.recommended && <Badge variant="secondary">Recommended</Badge>}
          {applied && <Badge>Applied</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{palette.description}</p>
      </div>
      {applying ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        applied && (
          <span className="rounded-full bg-primary p-1 text-primary-foreground">
            <Check className="h-4 w-4" />
          </span>
        )
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      {Object.entries(palette.colors).map(([label, value]) => (
        <Swatch key={label} label={label} value={value} />
      ))}
    </div>

    <div className="grid grid-cols-3 gap-2">
      <CouponChip label="Percent" c={palette.couponColors.percent} />
      <CouponChip label="Amount" c={palette.couponColors.amount} />
      <CouponChip label="Delivery" c={palette.couponColors.delivery} />
    </div>
  </button>
);

function ThemePalette() {
  const { store_id } = useAdminStore();
  const { data: theme, isLoading } = useGetStoreTheme(store_id);
  const { mutateAsync: saveTheme, isPending } = useSaveStoreTheme();

  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Which palette does the saved theme match (by primary colour)?
  const serverAppliedId =
    colorPalettes.find(
      (p) =>
        p.colors.primary.toLowerCase() === theme?.colors.primary?.toLowerCase(),
    )?.id ?? null;

  useEffect(() => {
    if (serverAppliedId) setAppliedId(serverAppliedId);
  }, [serverAppliedId]);

  const handleSelect = async (palette: ColorPalette) => {
    if (!store_id || isPending || palette.id === appliedId) return;
    const prev = appliedId;
    setAppliedId(palette.id); // optimistic
    setApplyingId(palette.id);
    try {
      await saveTheme({
        colors: palette.colors,
        coupons: palette.couponColors,
        store_id: Number(store_id),
      });
      toast.success(`${palette.name} applied`);
    } catch (err: any) {
      setAppliedId(prev); // revert on failure
      toast.error(err?.response?.data?.message || "Failed to apply theme");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Theme Palette</h1>
        <p className="text-muted-foreground">
          Select a theme to apply it to your store.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {colorPalettes.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              applied={palette.id === appliedId}
              applying={palette.id === applyingId}
              disabled={isPending}
              onSelect={() => handleSelect(palette)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemePalette;
