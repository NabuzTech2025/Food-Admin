import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  useGetThemePresets,
  useCreateThemePreset,
  useUpdateThemePreset,
  useDeleteThemePreset,
} from "@/hooks/useStoreTheme";
import type { ColorPalette } from "@/constants/themePalettes";

const COLOR_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "text-secondary",
  "icons",
  "border",
] as const;

const COUPON_TYPES = ["percent", "amount", "delivery"] as const;
const COUPON_PARTS = ["bg", "text", "subtext"] as const;

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const ID_RE = /^[a-z0-9-]{1,64}$/;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const EMPTY: ColorPalette = {
  id: "",
  name: "",
  description: "",
  recommended: false,
  display_order: 0,
  colors: {
    primary: "#E9251A",
    secondary: "#FFF4EF",
    accent: "#FF6B35",
    background: "#FFF4EF",
    surface: "#FFFFFF",
    text: "#202124",
    "text-secondary": "#6B625E",
    icons: "#E9251A",
    border: "#F0DCD5",
  },
  couponColors: {
    percent: { bg: "#FFF0ED", text: "#E9251A", subtext: "#B84B42" },
    amount: { bg: "#FFF1E8", text: "#FF6B35", subtext: "#A8542C" },
    delivery: { bg: "#F0F8E9", text: "#287A32", subtext: "#557A4D" },
  },
};

const clone = (p: ColorPalette): ColorPalette => ({
  ...p,
  description: p.description ?? "",
  display_order: p.display_order ?? 0,
  colors: { ...p.colors },
  couponColors: {
    percent: { ...p.couponColors.percent },
    amount: { ...p.couponColors.amount },
    delivery: { ...p.couponColors.delivery },
  },
});

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const valid = HEX.test(value);
  return (
    <div className="space-y-1">
      <Label className="text-xs capitalize">{label.replace("-", " ")}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid && value.length >= 7 ? value.slice(0, 7) : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-10 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
          title={label}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          className={cn("font-mono text-xs", !valid && "border-destructive")}
        />
      </div>
    </div>
  );
};

// Live preview so the admin sees the theme while editing it.
const Preview = ({ p }: { p: ColorPalette }) => {
  const c = p.colors;
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: c.background, border: `1px solid ${c.border}` }}
    >
      <div
        className="rounded-lg p-3"
        style={{ background: c.surface, border: `1px solid ${c.border}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p
              className="truncate text-sm font-bold"
              style={{ color: c.text }}
            >
              {p.name || "Theme name"}
            </p>
            <p className="text-[11px]" style={{ color: c["text-secondary"] }}>
              Live preview of your colours
            </p>
          </div>
          <span
            className="h-7 w-7 shrink-0 rounded-full"
            style={{ background: c.icons }}
          />
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2">
          <span
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{ background: c.primary, color: "#fff" }}
          >
            Primary
          </span>
          <span
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{ background: c.accent, color: c.text }}
          >
            Accent
          </span>
          <span
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{
              background: c.secondary,
              color: c.primary,
              border: `1px solid ${c.border}`,
            }}
          >
            Secondary
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {COUPON_TYPES.map((t) => (
            <div
              key={t}
              className="rounded-md px-2 py-1.5"
              style={{ background: p.couponColors[t].bg }}
            >
              <p
                className="text-[11px] font-semibold capitalize"
                style={{ color: p.couponColors[t].text }}
              >
                {t}
              </p>
              <p
                className="text-[9px]"
                style={{ color: p.couponColors[t].subtext }}
              >
                Example coupon
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function ThemePresets() {
  const { data: presets = [], isLoading } = useGetThemePresets();
  const { mutateAsync: createPreset, isPending: creating } =
    useCreateThemePreset();
  const { mutateAsync: updatePreset, isPending: updating } =
    useUpdateThemePreset();
  const { mutateAsync: deletePreset, isPending: deleting } =
    useDeleteThemePreset();

  const [form, setForm] = useState<ColorPalette | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [idEdited, setIdEdited] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const saving = creating || updating;

  const openCreate = () => {
    setForm(clone(EMPTY));
    setIsEdit(false);
    setIdEdited(false);
  };
  const openEdit = (p: ColorPalette) => {
    setForm(clone(p));
    setIsEdit(true);
    setIdEdited(true);
  };

  // While creating, auto-fill the id from the name until the admin edits it.
  const setName = (name: string) =>
    setForm((f) =>
      f ? { ...f, name, ...(!isEdit && !idEdited ? { id: slugify(name) } : {}) } : f,
    );

  const setColor = (key: string, v: string) =>
    setForm((f) =>
      f ? { ...f, colors: { ...f.colors, [key]: v } } : f,
    );
  const setCoupon = (type: string, part: string, v: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            couponColors: {
              ...f.couponColors,
              [type]: {
                ...f.couponColors[type as keyof typeof f.couponColors],
                [part]: v,
              },
            },
          }
        : f,
    );

  const validate = (f: ColorPalette): string | null => {
    if (!ID_RE.test(f.id))
      return "ID must be lowercase letters, numbers and hyphens (max 64).";
    if (!f.name.trim()) return "Name is required.";
    for (const k of COLOR_KEYS)
      if (!HEX.test(f.colors[k])) return `Invalid hex for "${k}".`;
    for (const t of COUPON_TYPES)
      for (const part of COUPON_PARTS)
        if (!HEX.test(f.couponColors[t][part]))
          return `Invalid hex for coupon ${t} ${part}.`;
    return null;
  };

  const handleSubmit = async () => {
    if (!form) return;
    const err = validate(form);
    if (err) {
      toast.error(err);
      return;
    }
    const payload: ColorPalette = {
      ...form,
      description: form.description?.trim() || null,
      display_order: Number(form.display_order) || 0,
    };
    try {
      if (isEdit) {
        const { id, ...rest } = payload;
        await updatePreset({ id, payload: rest });
        toast.success(`${payload.name} updated`);
      } else {
        await createPreset(payload);
        toast.success(`${payload.name} created`);
      }
      setForm(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save theme");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePreset(deleteId);
      toast.success("Theme deleted");
      setDeleteId(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete theme");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Theme Presets</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage the colour themes stores can pick from.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1">
          <Plus size={16} />
          Add Theme
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : presets.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          No themes yet. Click “Add Theme” to create one.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {presets.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{p.name}</h3>
                    {p.recommended && (
                      <Badge variant="secondary" className="gap-1">
                        <Star size={11} /> Rec
                      </Badge>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {p.id}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_KEYS.map((k) => (
                  <span
                    key={k}
                    title={`${k}: ${p.colors[k]}`}
                    className="h-6 w-6 rounded border border-black/10"
                    style={{ backgroundColor: p.colors[k] }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="flex h-[88vh] w-[95vw] max-w-5xl flex-col overflow-hidden p-0 sm:max-w-5xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{isEdit ? "Edit Theme" : "Add Theme"}</DialogTitle>
          </DialogHeader>

          {form && (
            <>
              <div className="flex flex-1 flex-col-reverse overflow-hidden lg:flex-row">
                {/* Form fields (left) */}
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={form.name}
                        placeholder="Classic Food Red"
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        ID <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={form.id}
                        disabled={isEdit}
                        placeholder="classic-food-red"
                        onChange={(e) => {
                          setIdEdited(true);
                          setForm({ ...form, id: e.target.value });
                        }}
                        className="font-mono text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {isEdit
                          ? "The ID can’t be changed."
                          : "Auto-filled from the name. Lowercase letters, numbers and hyphens."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={form.description ?? ""}
                      rows={2}
                      placeholder="Short line shown under the theme name"
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Display order</Label>
                      <Input
                        type="number"
                        value={form.display_order ?? 0}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            display_order: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch
                        checked={form.recommended}
                        onCheckedChange={(v) =>
                          setForm({ ...form, recommended: v })
                        }
                        id="recommended"
                      />
                      <Label htmlFor="recommended" className="text-xs">
                        Recommended
                      </Label>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold">Colors</p>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                      {COLOR_KEYS.map((k) => (
                        <ColorField
                          key={k}
                          label={k}
                          value={form.colors[k]}
                          onChange={(v) => setColor(k, v)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold">Coupon Colors</p>
                    <div className="space-y-4">
                      {COUPON_TYPES.map((t) => (
                        <div
                          key={t}
                          className="rounded-lg border border-border p-3"
                        >
                          <p className="mb-2 text-xs font-semibold capitalize text-muted-foreground">
                            {t}
                          </p>
                          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
                            {COUPON_PARTS.map((part) => (
                              <ColorField
                                key={part}
                                label={part}
                                value={form.couponColors[t][part]}
                                onChange={(v) => setCoupon(t, part, v)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live preview (right, docked) */}
                <div className="shrink-0 border-b bg-muted/30 px-6 py-4 lg:w-[320px] lg:overflow-y-auto lg:border-b-0 lg:border-l">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Preview
                  </p>
                  <Preview p={form} />
                </div>
              </div>

              {/* Fixed footer — always reachable */}
              <div className="flex justify-end gap-2 border-t px-6 py-3">
                <Button variant="outline" onClick={() => setForm(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  {isEdit ? "Save changes" : "Create theme"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete theme?"
        description="This preset will be removed. Stores already using these colours keep them."
        confirmText="Delete"
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ThemePresets;
