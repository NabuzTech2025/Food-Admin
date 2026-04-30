import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ImagePlus, X, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateStore } from "@/hooks/useStoreDetails";
import { useUploadImage } from "@/hooks/Common/useUploadImage";

function StoreProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeData } = location.state || {};

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>(
    storeData?.image_url?.split("?")[0] || storeData?.logo || "",
  );

  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>(
    storeData?.banner_url?.split("?")[0] || storeData?.banner || "",
  );

  const { mutateAsync: updateStore, isPending: isUpdating } = useUpdateStore();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const isLoading = isUpdating || isUploading;

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!storeData?.id) {
      toast.error("Store ID not found. Cannot update.");
      return;
    }

    let updatedLogoUrl =
      storeData?.image_url?.split("?")[0] || storeData?.logo || "";
    let updatedBannerUrl =
      storeData?.banner_url?.split("?")[0] || storeData?.banner || "";

    try {
      // Upload profile image
      if (profileImage) {
        const res = await uploadImage({ file: profileImage });
        updatedLogoUrl =
          res.url?.split("?")[0] || res.image_url?.split("?")[0] || "";
      }

      // Upload banner image
      if (bannerImage) {
        const res = await uploadImage({ file: bannerImage });
        updatedBannerUrl =
          res.url?.split("?")[0] || res.image_url?.split("?")[0] || "";
      }

      await updateStore({
        id: storeData.id,
        payload: {
          name: storeData.name,
          manual_status: storeData.manual_status ?? "close",
          image_url: updatedLogoUrl,
          banner_url: updatedBannerUrl,
        },
      });

      toast.success("Store profile updated successfully!");
      navigate("/store-details");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update store profile",
      );
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">
          Store Profile {storeData?.name ? `— ${storeData.name}` : ""}
        </h2>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-1" size={16} />
              {isUploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Store Logo Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-neutral-800">
              Store Logo
            </h3>
          </div>
          <div className="p-5 flex items-center gap-5">
            {/* Preview */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store size={36} className="text-neutral-400" />
                )}
              </div>
              {profilePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileImage(null);
                    setProfilePreview("");
                  }}
                  className="absolute -top-1 -right-1 bg-white rounded-full shadow text-destructive border border-border"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700">
                Upload Store Logo
              </p>
              <p className="text-xs text-neutral-400">
                Square image recommended for best results.
              </p>
              <label className="flex items-center gap-1.5 text-xs border border-dashed border-neutral-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary hover:text-primary transition-colors w-fit">
                <ImagePlus size={15} />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Store Banner Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-neutral-800">
              Store Banner
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {/* Banner Preview */}
            {bannerPreview ? (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner Preview"
                  className="w-full h-36 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBannerImage(null);
                    setBannerPreview("");
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full shadow text-destructive border border-border p-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-full h-36 rounded-lg border-2 border-dashed border-neutral-200 bg-muted/30 flex flex-col items-center justify-center text-neutral-400 gap-1">
                <ImagePlus size={28} />
                <span className="text-xs">No banner selected</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs border border-dashed border-neutral-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary hover:text-primary transition-colors w-fit">
                <ImagePlus size={15} />
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                />
              </label>
              <p className="text-xs text-neutral-400">
                Recommended size: 1200×400 px
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreProfilePage;
