import { useEffect, useState } from "react";
import { Loader2, CreditCard, Banknote, Landmark, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  useGetPaymentSettings,
  useCreatePaymentSettings,
  useUpdatePaymentSettings,
} from "@/hooks/usePaymentSettings";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface PaymentMethod {
  key: "cash_enabled" | "card_enabled" | "stripe_enabled" | "paypal_enabled";
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
];

function PaymentSettingsPage() {
  const { storeId } = useParams();

  const store_id = Number(storeId);

  const { data, isLoading } = useGetPaymentSettings(store_id);
  const { mutate: create, isPending: isCreating } = useCreatePaymentSettings();
  const { mutate: update, isPending: isUpdating } = useUpdatePaymentSettings();

  const isPending = isCreating || isUpdating;

  const [settings, setSettings] = useState({
    cash_enabled: false,
    card_enabled: false,
    stripe_enabled: false,
    paypal_enabled: false,
  });

  useEffect(() => {
    if (data) {
      setSettings({
        cash_enabled: data.cash_enabled,
        card_enabled: data.card_enabled,
        stripe_enabled: data.stripe_enabled,
        paypal_enabled: data.paypal_enabled,
      });
    }
  }, [data]);

  const toggle = (key: keyof typeof settings) => {
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

    const onSuccess = () => toast.success("Payment settings updated");

    if (data?.id) {
      update({ id: store_id as number, payload }, { onSuccess, onError });
    } else {
      create(payload, {
        onError,
        onSuccess: () => toast.success("Payment settings saved"),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Payment Methods
          </h2>
          {isPending && (
            <Loader2 size={18} className="animate-spin text-primary" />
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : (
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
                    <p className="text-sm font-medium text-neutral-800">
                      {label}
                    </p>
                    <p className="text-xs text-neutral-500">{description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[key]}
                  onCheckedChange={() => toggle(key)}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Enable or disable payment methods available to customers at
            checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSettingsPage;
