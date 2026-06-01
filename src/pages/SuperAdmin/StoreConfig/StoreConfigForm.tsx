import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateStoreConfig,
  useUpdateStoreConfig,
} from "@/hooks/useStoreConfig";
import type { FooterItem, Language } from "@/api/storeConfig";

function StoreConfigFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { configData, mode } = location.state || {};
  const isEdit = mode === "edit";

  const [domain, setDomain] = useState(configData?.domain ?? "");
  const [storeId, setStoreId] = useState<string>(
    String(configData?.store_id ?? ""),
  );
  const [appName, setAppName] = useState(configData?.app_name ?? "");
  const [appBaseRoute, setAppBaseRoute] = useState(
    configData?.app_base_route ?? "",
  );
  const [copyrightText, setCopyrightText] = useState(
    configData?.copyright_text ?? "",
  );
  const [footerItems, setFooterItems] = useState<FooterItem[]>(
    Array.isArray(configData?.footer) ? configData.footer : [],
  );
  const [language, setLanguage] = useState<Language>(
    configData?.language ?? "en",
  );

  const { mutateAsync: createConfig, isPending: isCreating } =
    useCreateStoreConfig();
  const { mutateAsync: updateConfig, isPending: isUpdating } =
    useUpdateStoreConfig();

  const isPending = isCreating || isUpdating;

  const addFooterItem = () => {
    setFooterItems((prev) => [...prev, { label: "", link: "" }]);
  };

  const removeFooterItem = (index: number) => {
    setFooterItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFooterItem = (
    index: number,
    field: keyof FooterItem,
    value: string,
  ) => {
    setFooterItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async () => {
    if (!storeId || !appName || !appBaseRoute || !copyrightText) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!domain.trim()) {
      toast.error("Domain is required.");
      return;
    }

    if (isEdit) {
      try {
        await updateConfig({
          domain: domain.trim(),
          payload: {
            domain: domain.trim(),
            store_id: Number(storeId),
            app_name: appName,
            app_base_route: appBaseRoute,
            copyright_text: copyrightText,
            language,
            footer: footerItems.length > 0 ? footerItems : undefined,
          },
        });
        toast.success("Store config updated successfully!");
        navigate("/super/store-config");
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to update store config",
        );
      }
    } else {
      try {
        await createConfig({
          domain: domain.trim(),
          store_id: Number(storeId),
          app_name: appName,
          app_base_route: appBaseRoute,
          copyright_text: copyrightText,
          language,
          footer: footerItems.length > 0 ? footerItems : undefined,
        });
        toast.success("Store config created successfully!");
        navigate("/super/store-config");
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to create store config",
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/super/store-config")}
            className="gap-1 text-neutral-600"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h2 className="text-lg font-semibold text-neutral-800">
            {isEdit ? "Edit Store Config" : "Add Store Config"}
            {isEdit && configData?.app_name ? ` — ${configData.app_name}` : ""}
          </h2>
        </div>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin mr-1" size={16} />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update Config"
          ) : (
            "Create Config"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Fields */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-neutral-800">
              Basic Information
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="domain">
                Domain <span className="text-destructive">*</span>
              </Label>
              <Input
                id="domain"
                placeholder="e.g. rapidopizza.de"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              {isEdit && (
                <p className="text-xs text-neutral-400">
                  Enter the domain used to identify this config in the update
                  request.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeId">
                Store ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storeId"
                type="number"
                placeholder="e.g. 13"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appName">
                App Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appName"
                placeholder="e.g. Bombay Online Store"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appBaseRoute">
                App Base Route <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appBaseRoute"
                placeholder="e.g. order-online"
                value={appBaseRoute}
                onChange={(e) => setAppBaseRoute(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="copyrightText">
                Copyright Text <span className="text-destructive">*</span>
              </Label>
              <Input
                id="copyrightText"
                placeholder="e.g. © 2024 Bombay Online"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="language">
                Select Default Language{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Language)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (en)</SelectItem>
                  <SelectItem value="de">German (de)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer Items — shown in both create and edit mode */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">
              Footer Links
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addFooterItem}
              className="gap-1 text-xs"
            >
              <Plus size={13} />
              Add Link
            </Button>
          </div>
          <div className="p-5 space-y-3">
            {footerItems.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                No footer links yet.{" "}
                <button
                  onClick={addFooterItem}
                  className="text-primary underline"
                >
                  Add one
                </button>
              </p>
            ) : (
              footerItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border border-border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) =>
                        updateFooterItem(index, "label", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Link URL"
                      value={item.link}
                      onChange={(e) =>
                        updateFooterItem(index, "link", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFooterItem(index)}
                    className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Read-only info from GET response (edit mode only) */}
        {isEdit && configData && (
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-neutral-800">
                Current Store Info
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Country</span>
                <span className="font-medium">{configData.country || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Distance Delivery</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    configData.use_distance_delivery
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {configData.use_distance_delivery ? "Enabled" : "Disabled"}
                </span>
              </div>
              {configData.paypal_live_client_id && (
                <div className="space-y-1">
                  <span className="text-sm text-neutral-500">
                    PayPal Client ID
                  </span>
                  <p className="text-xs text-neutral-700 break-all bg-muted/40 rounded-md p-2">
                    {configData.paypal_live_client_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreConfigFormPage;
