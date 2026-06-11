import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useGetStore, useUpdateStore } from "@/hooks/useStore";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

function Settings() {
  const { storeId } = useParams();
  const store_id = Number(storeId);

  const { data, isLoading } = useGetStore(store_id);
  const { mutate: updateStore, isPending } = useUpdateStore();

  const [useDistanceDelivery, setUseDistanceDelivery] = useState(false);

  useEffect(() => {
    if (data) {
      setUseDistanceDelivery(data.use_distance_delivery ?? false);
    }
  }, [data]);

  const toggle = () => {
    if (!store_id || isPending) return;

    const newValue = !useDistanceDelivery;
    setUseDistanceDelivery(newValue);

    updateStore(
      { id: store_id, payload: { use_distance_delivery: newValue } },
      {
        onSuccess: () => toast.success("Settings updated"),
        onError: (err: any) => {
          setUseDistanceDelivery(!newValue);
          toast.error(
            err?.response?.data?.message || "Failed to update settings",
          );
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            General Settings
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
            <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <MapPin size={22} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    Distance-based Delivery
                  </p>
                  <p className="text-xs text-neutral-500">
                    Calculate delivery fees based on customer distance from the
                    store
                  </p>
                </div>
              </div>
              <Switch
                checked={useDistanceDelivery}
                onCheckedChange={toggle}
                className="cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-muted/30">
          <p className="text-xs text-neutral-500">
            Enable distance-based delivery to charge customers according to how
            far they are from the store.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
