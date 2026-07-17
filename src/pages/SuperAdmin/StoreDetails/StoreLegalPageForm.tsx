import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/RichTextEditor";
import {
  useCreateStoreLegalPage,
  useUpdateStoreLegalPage,
} from "@/hooks/useStoreLegalPages";
import type { StoreLegalPage } from "@/api/storeLegalPages";

function StoreLegalPageFormPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pageData } = (location.state || {}) as {
    pageData?: StoreLegalPage;
  };
  const isEdit = !!pageData;

  const backLink = `/super/stores/${storeId}/legal-pages`;

  const [slug, setSlug] = useState(pageData?.slug ?? "");
  const [title, setTitle] = useState(pageData?.title ?? "");
  const [content, setContent] = useState(pageData?.content ?? "");
  const [language, setLanguage] = useState(pageData?.language ?? "de");
  const [sortOrder, setSortOrder] = useState(
    String(pageData?.sort_order ?? 1),
  );
  const [isPublished, setIsPublished] = useState(
    pageData?.is_published ?? true,
  );

  const { mutateAsync: createPage, isPending: isCreating } =
    useCreateStoreLegalPage();
  const { mutateAsync: updatePage, isPending: isUpdating } =
    useUpdateStoreLegalPage();
  const isSaving = isCreating || isUpdating;

  const handleSave = async () => {
    if (!slug.trim() || !title.trim() || !content.trim()) {
      toast.error("Slug, title and content are required.");
      return;
    }

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      content,
      language: language.trim() || "de",
      sort_order: parseInt(sortOrder) || 0,
      is_published: isPublished,
    };

    try {
      if (isEdit) {
        await updatePage({ pageId: pageData!.id, payload });
        toast.success("Legal page updated successfully!");
      } else {
        await createPage({ ...payload, store_id: Number(storeId) });
        toast.success("Legal page created successfully!");
      }
      navigate(backLink);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to save legal page",
      );
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(backLink)}
            className="gap-1 text-neutral-600"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h2 className="text-lg font-semibold text-neutral-800">
            {isEdit ? `Edit Legal Page — ${pageData?.title}` : "Add Legal Page"}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="animate-spin mr-1" size={16} />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-neutral-800">
            Page Basic Details
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Impressum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="e.g. impressum"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="de"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Published</Label>
              <div className="h-10 flex items-center">
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-neutral-800">Content</h3>
        </div>
        <div className="p-5">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write the page content…"
          />
        </div>
      </div>
    </div>
  );
}

export default StoreLegalPageFormPage;
