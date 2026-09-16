import { useEffect, useState } from "react";
import { Loader2, CreditCard, Banknote, Landmark, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetPaymentSettings,
  useCreatePaymentSettings,
  useUpdatePaymentSettings,
  useGetOrderTypeSettings,
  useUpdateOrderTypeSettings,
  useResetOrderTypeSettings,
} from "@/hooks/usePaymentSettings";
import type { PaymentFlags, OrderTypeName } from "@/api/paymentSettings";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

type FlagKey = keyof PaymentFlags;

interface PaymentMethod {
  key: FlagKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    key: "cash_enabled",
    label: "Cash",
    description: "Accept cash payments on delivery or pickup",
    icon: <Banknote size={22} className="text-green-600" />,
  },
  {
    key: "card_enabled",
    label: "Card",
    description: "Accept debit and credit card payments",
    icon: <CreditCard size={22} className="text-blue-600" />,
  },
  {
    key: "stripe_enabled",
    label: "Stripe",
    description: "Accept online payments via Stripe",
    icon: <Landmark size={22} className="text-violet-600" />,
  },
  {
    key: "paypal_enabled",
    label: "PayPal",
    description: "Accept payments via PayPal",
    icon: <Wallet size={22} className="text-sky-500" />,
  },
  {
    key: "ec_enabled",
    label: "EC",
    description: "Accept EC payments",
    icon: <CreditCard size={22} className="text-orange-500" />,
  },
];

const ORDER_TYPES: { key: OrderTypeName; label: string }[] = [
  { key: "delivery", label: "Delivery" },
  { key: "collection", label: "Collection" },
];

function MethodRows({
  flags,
  onToggle,
  disabled,
}: {
  flags: PaymentFlags;
  onToggle: (key: FlagKey) => void;
  disabled: boolean;
}) {
  return (
    <div className="divide-y divide-border">
      {PAYMENT_METHODS.map(({ key, label, description, icon }) => (
        <div
          key={key}
          className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">{label}</p>
              <p className="text-xs text-neutral-500">{description}</p>
            </div>
          </div>
          <Switch
            checked={flags[key]}
            onCheckedChange={() => onToggle(key)}
            disabled={disabled}
            className="cursor-pointer"
          />
        </div>
      ))}
    </div>
  );
}

const EMPTY_FLAGS: PaymentFlags = {
  cash_enabled: false,
  card_enabled: false,
  stripe_enabled: false,
  paypal_enabled: false,
  ec_enabled: false,
};

function StoreWideCard({ store_id }: { store_id: number }) {
  const { data, isLoading } = useGetPaymentSettings(store_id);
  const { mutate: create, isPending: isCreating } = useCreatePaymentSettings();
  const { mutate: update, isPending: isUpdating } = useUpdatePaymentSettings();

  const isPending = isCreating || isUpdating;

  const [settings, setSettings] = useState<PaymentFlags>(EMPTY_FLAGS);

  useEffect(() => {
    if (data) {
      setSettings({
        cash_enabled: data.cash_enabled,
        card_enabled: data.card_enabled,
        stripe_enabled: data.stripe_enabled,
        paypal_enabled: data.paypal_enabled,
        ec_enabled: data.ec_enabled,
      });
    }
  }, [data]);

  const toggle = (key: FlagKey) => {
    if (!store_id || isPending) return;

    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    const payload = { ...newSettings, store_id };

    const onError = (err: any) => {
      setSettings(settings);
      toast.error(
        err?.response?.data?.message || "Failed to update payment settings",
      );
    };

    if (data?.id) {
      update(
        { id: store_id as number, payload },
        { onSuccess: () => toast.success("Payment settings updated"), onError },
      );
    } else {
      create(payload, {
        onError,
        onSuccess: () => toast.success("Payment settings saved"),
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">
            Payment Methods
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Store-wide default. Order types with no override inherit these.
          </p>
        </div>
        {isPending && (
          <Loader2 size={18} className="animate-spin text-primary" />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (
        <MethodRows flags={settings} onToggle={toggle} disabled={isPending} />
      )}

      <div className="px-5 py-3 border-t bg-muted/30">
        <p className="text-xs text-neutral-500">
          Enable or disable payment methods available to customers at checkout.
        </p>
      </div>
    </div>
  );
}

function OrderTypeEditor({ store_id }: { store_id: number }) {
  const { data, isLoading } = useGetOrderTypeSettings(store_id);
  const { mutate: save, isPending: isSaving } =
    useUpdateOrderTypeSettings(store_id);
  const { mutate: reset, isPending: isResetting } =
    useResetOrderTypeSettings(store_id);

  const isPending = isSaving || isResetting;

  // Local mirror of server flags, keyed by order type, for optimistic toggles.
  const [flagsByType, setFlagsByType] = useState<
    Record<OrderTypeName, PaymentFlags>
  >({
    delivery: EMPTY_FLAGS,
    collection: EMPTY_FLAGS,
    dine_in: EMPTY_FLAGS,
  });

  useEffect(() => {
    if (data) {
      setFlagsByType({
        delivery:
          data.find((d) => d.order_type_name === "delivery")?.flags ??
          EMPTY_FLAGS,
        collection:
          data.find((d) => d.order_type_name === "collection")?.flags ??
          EMPTY_FLAGS,
        dine_in:
          data.find((d) => d.order_type_name === "dine_in")?.flags ??
          EMPTY_FLAGS,
      });
    }
  }, [data]);

  const toggle = (orderType: OrderTypeName, key: FlagKey) => {
    if (isPending) return;

    const prev = flagsByType[orderType];
    const next = { ...prev, [key]: !prev[key] };
    setFlagsByType((s) => ({ ...s, [orderType]: next }));

    // Send all five — a full set is what the toggles represent.
    save(
      { order_type: orderType, flags: next },
      {
        onSuccess: () => toast.success("Payment settings updated"),
        onError: (err: any) => {
          setFlagsByType((s) => ({ ...s, [orderType]: prev }));
          toast.error(
            err?.response?.data?.message || "Failed to update payment settings",
          );
        },
      },
    );
  };

  const handleReset = (orderType: OrderTypeName) => {
    if (isPending) return;
    reset(orderType, {
      onSuccess: () => toast.success("Reset to store default"),
      onError: (err: any) =>
        toast.error(err?.response?.data?.message || "Failed to reset"),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">
            Payment by Order Type
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Override the store default for a specific order type.
          </p>
        </div>
        {isPending && (
          <Loader2 size={18} className="animate-spin text-primary" />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (
        <Tabs defaultValue="delivery" className="p-4">
          <TabsList className="w-full">
            {ORDER_TYPES.map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {ORDER_TYPES.map(({ key }) => {
            const isOverride =
              data?.find((d) => d.order_type_name === key)?.is_override ??
              false;
            return (
              <TabsContent key={key} value={key} className="mt-2">
                <div className="flex items-center justify-between px-1 py-2">
                  <p className="text-xs text-neutral-500">
                    {isOverride
                      ? "Using custom settings for this order type."
                      : "Using store default."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isOverride || isPending}
                    onClick={() => handleReset(key)}
                  >
                    Reset to default
                  </Button>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <MethodRows
                    flags={flagsByType[key]}
                    onToggle={(mk) => toggle(key, mk)}
                    disabled={isPending}
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

function PaymentSettingsPage() {
  const { storeId } = useParams();
  const store_id = Number(storeId);

  return (
    <div className="space-y-4">
      <StoreWideCard store_id={store_id} />
      <OrderTypeEditor store_id={store_id} />
    </div>
  );
}

export default PaymentSettingsPage;
