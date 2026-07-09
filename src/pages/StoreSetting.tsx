import { useEffect, useState } from "react";
import {
  Loader2,
  ShoppingBag,
  Printer,
  Store,
  Clock,
  Truck,
  Package,
  Calendar,
  Monitor,
  MonitorSmartphone,
  Landmark,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useGetStoreSettings,
  useAddStoreSettings,
  useUpdateStoreSettings,
} from "@/hooks/useStoreSettings";

const SETTING_FIELDS = [
  {
    key: "auto_accept_orders_remote",
    label: "Auto Accept Remote Orders",
    description: "Automatically accept online orders",
    icon: <ShoppingBag size={22} className="text-blue-600" />,
    allow_role: [1, 2],
  },
  {
    key: "auto_print_orders_remote",
    label: "Auto Print Remote Orders",
    description: "Automatically print online orders",
    icon: <Printer size={22} className="text-violet-600" />,
    allow_role: [1],
  },
  {
    key: "auto_accept_orders_local",
    label: "Auto Accept Local Orders",
    description: "Automatically accept local orders",
    icon: <Store size={22} className="text-green-600" />,
    allow_role: [1],
  },
  {
    key: "auto_print_orders_local",
    label: "Auto Print Local Orders",
    description: "Automatically print local orders",
    icon: <Printer size={22} className="text-orange-600" />,
    allow_role: [1],
  },
  {
    key: "auto_accept_reservations",
    label: "Auto Accept Reservations",
    description: "Automatically accept reservations",
    icon: <Calendar size={22} className="text-pink-600" />,
    allow_role: [1, 2],
  },
  {
    key: "lieferung_enabled",
    label: "Delivery Enabled",
    description: "Allow delivery orders",
    icon: <Truck size={22} className="text-cyan-600" />,
    allow_role: [1, 2],
  },
  {
    key: "abholung_enabled",
    label: "Pickup Enabled",
    description: "Allow pickup orders",
    icon: <Package size={22} className="text-yellow-600" />,
    allow_role: [1, 2],
  },
  {
    key: "is_kasse_integrated",
    label: "Kasse Integration",
    description: "Enable POS integration",
    icon: <Monitor size={22} className="text-red-600" />,
    allow_role: [1],
  },
  {
    key: "is_windows_app",
    label: "Windows App",
    description: "Enable Windows application",
    icon: <MonitorSmartphone size={22} className="text-indigo-600" />,
    allow_role: [1],
  },
];

interface Props {
  storeId?: number | string | null;
}

export default function StoreSetting({ storeId: propStoreId }: Props = {}) {
  const { store_id: adminStoreId, role_id } = useAdminStore();

  const store_id = propStoreId ?? adminStoreId;

  const numericRoleId = Number(role_id);
  const visibleFields =
    numericRoleId === 1
      ? SETTING_FIELDS
      : SETTING_FIELDS.filter((f) => f.allow_role.includes(numericRoleId));

  const { data, isLoading } = useGetStoreSettings(store_id);

  const { mutate: create, isPending: isCreating } = useAddStoreSettings();

  const { mutate: update, isPending: isUpdating } = useUpdateStoreSettings();

  const isPending = isCreating || isUpdating;

  const [settings, setSettings] = useState({
    auto_accept_orders_remote: false,
    auto_print_orders_remote: false,
    auto_accept_orders_local: false,
    auto_print_orders_local: false,
    auto_accept_reservations: false,
    stripe_service_fee: 0,
    lieferung_enabled: true,
    abholung_enabled: true,
    is_kasse_integrated: false,
    is_windows_app: false,
    default_collection_time: 30,
  });

  useEffect(() => {
    if (!data) return;

    setSettings({
      auto_accept_orders_remote: data.auto_accept_orders_remote ?? false,
      auto_print_orders_remote: data.auto_print_orders_remote ?? false,
      auto_accept_orders_local: data.auto_accept_orders_local ?? false,
      auto_print_orders_local: data.auto_print_orders_local ?? false,
      auto_accept_reservations: data.auto_accept_reservations ?? false,
      stripe_service_fee: data.stripe_service_fee ?? 0,
      lieferung_enabled: data.lieferung_enabled ?? true,
      abholung_enabled: data.abholung_enabled ?? true,
      is_kasse_integrated: data.is_kasse_integrated ?? false,
      is_windows_app: data.is_windows_app ?? false,
      default_collection_time: data.default_collection_time ?? 30,
    });
  }, [data]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    if (!store_id) {
      toast.error("Store ID not found");
      return;
    }

    const payload = {
      ...settings,
      store_id,
    };

    const onSuccess = () => {
      toast.success("Store settings saved");
    };

    const onError = (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to save store settings",
      );
    };

    if (data?.id) {
      update(
        {
          id: store_id as number,
          payload: {
            ...payload,
            id: data.id,
          },
        },
        {
          onSuccess,
          onError,
        },
      );
    } else {
      create(payload, {
        onSuccess,
        onError,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-neutral-800">
            Store Settings
          </h2>

          {isPending && (
            <Loader2 size={18} className="animate-spin text-primary" />
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Switches */}
            <div className="divide-y divide-border">
              {visibleFields.map(({ key, label, description, icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {icon}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {label}
                      </p>
                      <p className="text-xs text-neutral-500">{description}</p>
                    </div>
                  </div>

                  <Switch
                    checked={settings[key as keyof typeof settings] as boolean}
                    onCheckedChange={() =>
                      toggleSetting(key as keyof typeof settings)
                    }
                  />
                </div>
              ))}
            </div>

            {/* Stripe Fee */}
            {numericRoleId === 1 && (
              <div className="border-t px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Landmark size={22} className="text-violet-600" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">Stripe Service Fee</p>
                    <p className="text-xs text-muted-foreground">
                      Additional fee for Stripe orders
                    </p>
                  </div>

                  <Input
                    type="number"
                    min={0}
                    className="w-32"
                    value={settings.stripe_service_fee}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        stripe_service_fee: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Collection Time */}
            <div className="border-t px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Clock size={22} className="text-amber-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">Default Collection Time</p>
                  <p className="text-xs text-muted-foreground">
                    Collection time in minutes
                  </p>
                </div>

                <Input
                  type="number"
                  min={0}
                  className="w-32"
                  value={settings.default_collection_time}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      default_collection_time: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t px-5 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Configure automatic order handling, delivery, pickup, reservations
            and collection settings.
          </p>
        </div>
      </div>
    </div>
  );
}
