import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useReservationConfig,
  useReservationStoreId,
  useUpdateReservationConfig,
} from "@/hooks/useReservationV2";
import type { ReservationConfig } from "@/api/reservationV2";

type Form = Omit<ReservationConfig, "store_id">;

const numberFields: { key: keyof Form; label: string; hint: string }[] = [
  { key: "max_covers", label: "Max Covers", hint: "Guests seatable at once" },
  {
    key: "slot_interval_minutes",
    label: "Slot Interval (min)",
    hint: "Spacing between slot start times",
  },
  {
    key: "default_duration_minutes",
    label: "Default Duration (min)",
    hint: "Default table hold",
  },
  {
    key: "max_party_size",
    label: "Max Party Size",
    hint: "Largest online booking",
  },
  {
    key: "lead_time_minutes",
    label: "Lead Time (min)",
    hint: "No booking within X min of now",
  },
  {
    key: "booking_window_days",
    label: "Booking Window (days)",
    hint: "How far ahead bookings open",
  },
];

function Settings() {
  const storeId = useReservationStoreId();
  const { data: config, isLoading } = useReservationConfig(storeId);
  const update = useUpdateReservationConfig(storeId);

  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (config) {
      const { store_id: _omit, ...rest } = config;
      setForm(rest);
    }
  }, [config]);

  const set = (key: keyof Form, value: number | boolean) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  if (!storeId)
    return (
      <p className="text-sm text-muted-foreground p-6">
        No store selected. Open this page as a store owner, or add{" "}
        <code>?store_id=&lt;id&gt;</code> to the URL.
      </p>
    );

  if (isLoading || !form)
    return <p className="text-sm text-muted-foreground p-6">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Reservation Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure how customers can book tables at this store.
        </p>
      </div>

      <div className="rounded-xl bg-component-bg border border-border p-5 space-y-5">
        {/* Master switch */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-off-bg p-4">
          <div>
            <Label htmlFor="enabled" className="text-base">
              Reservations Enabled
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Master switch for online booking at this store.
            </p>
          </div>
          <Switch
            id="enabled"
            checked={form.enabled}
            onCheckedChange={(v) => set("enabled", v)}
          />
        </div>

        {/* Numeric config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {numberFields.map(({ key, label, hint }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                min={0}
                value={form[key] as number}
                onChange={(e) => set(key, Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => update.mutate(form)}
            disabled={update.isPending}
          >
            {update.isPending ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
