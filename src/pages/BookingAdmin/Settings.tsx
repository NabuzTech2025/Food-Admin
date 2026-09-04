import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useBookingConfig,
  useBookingStoreId,
  useUpdateBookingConfig,
} from "@/hooks/useBookingV2";

type FormValues = {
  enabled: boolean;
  slot_interval_minutes: string;
  lead_time_minutes: string;
  booking_window_days: string;
  currency: string;
  require_payment: boolean;
  auto_accept: boolean;
};

function ToggleRow({
  label,
  hint,
  ...control
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={control.checked} onCheckedChange={control.onCheckedChange} />
    </div>
  );
}

function Settings() {
  const storeId = useBookingStoreId();
  const { data: config, isLoading } = useBookingConfig(storeId);
  const update = useUpdateBookingConfig(storeId);

  const { control, register, handleSubmit, reset } = useForm<FormValues>();

  // seed the form once config loads
  useEffect(() => {
    if (config) {
      reset({
        enabled: config.enabled,
        slot_interval_minutes: String(config.slot_interval_minutes),
        lead_time_minutes: String(config.lead_time_minutes),
        booking_window_days: String(config.booking_window_days),
        currency: config.currency,
        require_payment: config.require_payment,
        auto_accept: config.auto_accept,
      });
    }
  }, [config, reset]);

  const onSubmit = (v: FormValues) => {
    update.mutate({
      enabled: v.enabled,
      slot_interval_minutes: Number(v.slot_interval_minutes),
      lead_time_minutes: Number(v.lead_time_minutes),
      booking_window_days: Number(v.booking_window_days),
      currency: v.currency,
      require_payment: v.require_payment,
      auto_accept: v.auto_accept,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-component-bg border border-border p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3 rounded-xl bg-component-bg border border-border px-5 py-4">
        <span className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center">
          <SettingsIcon size={18} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">Booking Settings</h1>
          <p className="text-sm text-muted-foreground">Configure how bookings work for your store</p>
        </div>
      </div>

      {/* Toggles */}
      <section className="rounded-xl bg-component-bg border border-border p-5">
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <ToggleRow
              label="Bookings Enabled"
              hint="Allow customers to make bookings"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="require_payment"
          render={({ field }) => (
            <ToggleRow
              label="Require Payment"
              hint="Customers must pay to confirm a booking"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="auto_accept"
          render={({ field }) => (
            <ToggleRow
              label="Auto Accept"
              hint="Automatically accept new bookings"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </section>

      {/* Numeric config */}
      <section className="rounded-xl bg-component-bg border border-border p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="slot_interval_minutes">Slot Interval (min)</Label>
          <Input id="slot_interval_minutes" type="number" min={1} {...register("slot_interval_minutes")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead_time_minutes">Lead Time (min)</Label>
          <Input id="lead_time_minutes" type="number" min={0} {...register("lead_time_minutes")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking_window_days">Booking Window (days)</Label>
          <Input id="booking_window_days" type="number" min={1} {...register("booking_window_days")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" {...register("currency")} />
        </div>
      </section>

      <Button type="submit" className="w-full" disabled={update.isPending}>
        Save Settings
      </Button>
    </form>
  );
}

export default Settings;
