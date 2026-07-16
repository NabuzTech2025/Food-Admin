import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetStoreMetadata,
  useCreateStoreMetadata,
  useUpdateStoreMetadata,
  useDeleteStoreMetadata,
} from "@/hooks/useStoreMetadata";
import type { HeadingItem, ImageAltText } from "@/api/storeMetadata";

function TagListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft("");
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addValue}>
          <Plus size={14} />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((v, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-muted text-xs rounded-full px-2.5 py-1"
            >
              {v}
              <X
                size={12}
                className="cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={() => onChange(values.filter((_, vi) => vi !== i))}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface StructuredDataBlock {
  key: string;
  json: string;
}

function structuredDataToBlocks(
  data: Record<string, unknown> | undefined | null,
): StructuredDataBlock[] {
  if (!data || Object.keys(data).length === 0) return [];
  return Object.entries(data).map(([key, value]) => ({
    key,
    json: JSON.stringify(value, null, 2),
  }));
}

function StoreSEOPage() {
  const { storeId } = useParams();

  const { data: metadata, isLoading: isFetching } =
    useGetStoreMetadata(storeId);

  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [slug, setSlug] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robotsDirective, setRobotsDirective] = useState("index, follow");
  const [h1Heading, setH1Heading] = useState("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [imageAltTexts, setImageAltTexts] = useState<ImageAltText[]>([]);
  const [language, setLanguage] = useState("en");
  const [structuredDataBlocks, setStructuredDataBlocks] = useState<
    StructuredDataBlock[]
  >([]);
  const [sitemap, setSitemap] = useState<string[]>([]);
  const [robotsTxt, setRobotsTxt] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  const { mutateAsync: createMetadata, isPending: isCreating } =
    useCreateStoreMetadata();
  const { mutateAsync: updateMetadata, isPending: isUpdating } =
    useUpdateStoreMetadata();
  const { mutateAsync: deleteMetadata, isPending: isDeleting } =
    useDeleteStoreMetadata();

  const isSaving = isCreating || isUpdating;
  const isEdit = !!metadata;

  useEffect(() => {
    if (!metadata) return;
    setPageTitle(metadata.page_title ?? "");
    setMetaDescription(metadata.meta_description ?? "");
    setPrimaryKeyword(metadata.primary_keyword ?? "");
    setSecondaryKeywords(metadata.secondary_keywords ?? []);
    setSlug(metadata.slug ?? "");
    setCanonicalUrl(metadata.canonical_url ?? "");
    setRobotsDirective(metadata.robots_directive ?? "index, follow");
    setH1Heading(metadata.h1_heading ?? "");
    setHeadings(metadata.h2_h3_headings ?? []);
    setImageAltTexts(metadata.image_alt_texts ?? []);
    setLanguage(metadata.language ?? "en");
    setStructuredDataBlocks(structuredDataToBlocks(metadata.structured_data));
    setSitemap(metadata.sitemap ?? []);
    setRobotsTxt(metadata.robots_txt ?? "");
    setContactEmail(metadata.contact_email ?? "");
    setContactPhone(metadata.contact_phone ?? "");
    setContactAddress(metadata.contact_address ?? "");
  }, [metadata]);

  const addHeading = () =>
    setHeadings((prev) => [...prev, { tag: "h2", text: "" }]);
  const updateHeading = (
    index: number,
    field: keyof HeadingItem,
    value: string,
  ) =>
    setHeadings((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  const removeHeading = (index: number) =>
    setHeadings((prev) => prev.filter((_, i) => i !== index));

  const addImageAlt = () =>
    setImageAltTexts((prev) => [...prev, { image_url: "", alt: "" }]);
  const updateImageAlt = (
    index: number,
    field: keyof ImageAltText,
    value: string,
  ) =>
    setImageAltTexts((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    );
  const removeImageAlt = (index: number) =>
    setImageAltTexts((prev) => prev.filter((_, i) => i !== index));

  const addStructuredDataBlock = () =>
    setStructuredDataBlocks((prev) => [
      ...prev,
      { key: `schema${prev.length + 1}`, json: "{\n  \n}" },
    ]);
  const updateStructuredDataBlock = (
    index: number,
    field: keyof StructuredDataBlock,
    value: string,
  ) =>
    setStructuredDataBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    );
  const removeStructuredDataBlock = (index: number) =>
    setStructuredDataBlocks((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!storeId) {
      toast.error("Store ID not found. Cannot save.");
      return;
    }

    const parsedStructuredData: Record<string, unknown> = {};
    for (const block of structuredDataBlocks) {
      const key = block.key.trim();
      if (!key) {
        toast.error("Every structured data block needs a key.");
        return;
      }
      try {
        parsedStructuredData[key] = JSON.parse(block.json);
      } catch {
        toast.error(`Structured data block "${key}" is not valid JSON.`);
        return;
      }
    }

    const payload = {
      page_title: pageTitle,
      meta_description: metaDescription,
      primary_keyword: primaryKeyword,
      secondary_keywords: secondaryKeywords,
      slug,
      canonical_url: canonicalUrl,
      robots_directive: robotsDirective,
      h1_heading: h1Heading,
      h2_h3_headings: headings,
      image_alt_texts: imageAltTexts,
      language,
      structured_data: parsedStructuredData,
      sitemap,
      robots_txt: robotsTxt,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      contact_address: contactAddress,
    };

    try {
      if (isEdit) {
        await updateMetadata({ storeId, payload });
        toast.success("SEO metadata updated successfully!");
      } else {
        await createMetadata({ ...payload, store_id: Number(storeId) });
        toast.success("SEO metadata created successfully!");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Please check the form for errors."
          : "Failed to save SEO metadata",
      );
    }
  };

  const handleDelete = async () => {
    if (!storeId) return;
    if (!confirm("Delete SEO metadata for this store?")) return;
    try {
      await deleteMetadata(storeId);
      toast.success("SEO metadata deleted successfully!");
    } catch {
      toast.error("Failed to delete SEO metadata");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">SEO</h2>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          )}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic SEO */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-neutral-800">
              Basic SEO
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryKeyword">Primary Keyword</Label>
              <Input
                id="primaryKeyword"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
              />
            </div>
            <TagListInput
              label="Secondary Keywords"
              values={secondaryKeywords}
              onChange={setSecondaryKeywords}
              placeholder="Type a keyword and press Enter"
            />
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="robotsDirective">Robots Directive</Label>
              <Input
                id="robotsDirective"
                placeholder="index, follow"
                value={robotsDirective}
                onChange={(e) => setRobotsDirective(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="en"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">Headings</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addHeading}
              className="gap-1 text-xs"
            >
              <Plus size={13} />
              Add Heading
            </Button>
          </div>
          <div className="p-5 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="h1Heading">H1 Heading</Label>
              <Input
                id="h1Heading"
                value={h1Heading}
                onChange={(e) => setH1Heading(e.target.value)}
              />
            </div>

            {headings.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                No H2/H3 headings yet.{" "}
                <button onClick={addHeading} className="text-primary underline">
                  Add one
                </button>
              </p>
            ) : (
              headings.map((h, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border border-border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Tag (h2, h3)"
                      value={h.tag}
                      onChange={(e) =>
                        updateHeading(index, "tag", e.target.value)
                      }
                    />
                    <Input
                      className="col-span-2"
                      placeholder="Heading text"
                      value={h.text}
                      onChange={(e) =>
                        updateHeading(index, "text", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeading(index)}
                    className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Image Alt Texts */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">
              Image Alt Texts
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addImageAlt}
              className="gap-1 text-xs"
            >
              <Plus size={13} />
              Add Image
            </Button>
          </div>
          <div className="p-5 space-y-3">
            {imageAltTexts.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                No image alt texts yet.{" "}
                <button
                  onClick={addImageAlt}
                  className="text-primary underline"
                >
                  Add one
                </button>
              </p>
            ) : (
              imageAltTexts.map((img, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border border-border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Image URL"
                      value={img.image_url}
                      onChange={(e) =>
                        updateImageAlt(index, "image_url", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Alt text"
                      value={img.alt}
                      onChange={(e) =>
                        updateImageAlt(index, "alt", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageAlt(index)}
                    className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Structured Data (JSON-LD) */}
        <div className="bg-white rounded-xl border border-border shadow-sm md:col-span-2">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">
                Structured Data (JSON-LD)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Each block becomes one{" "}
                <code>&lt;script type="application/ld+json"&gt;</code> tag on
                the storefront.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addStructuredDataBlock}
              className="gap-1 text-xs"
            >
              <Plus size={13} />
              Add Block
            </Button>
          </div>
          <div className="p-5 space-y-3">
            {structuredDataBlocks.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                No structured data blocks yet.{" "}
                <button
                  onClick={addStructuredDataBlock}
                  className="text-primary underline"
                >
                  Add one
                </button>
              </p>
            ) : (
              structuredDataBlocks.map((block, index) => (
                <div
                  key={index}
                  className="p-3 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      className="max-w-xs"
                      placeholder="Key (e.g. restaurant)"
                      value={block.key}
                      onChange={(e) =>
                        updateStructuredDataBlock(index, "key", e.target.value)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStructuredDataBlock(index)}
                      className="text-destructive hover:text-destructive shrink-0 h-8 w-8 ml-auto"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                  <Textarea
                    className="font-mono text-xs min-h-32"
                    placeholder='{"@context": "https://schema.org", "@type": "Restaurant", ...}'
                    value={block.json}
                    onChange={(e) =>
                      updateStructuredDataBlock(index, "json", e.target.value)
                    }
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Crawling */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-neutral-800">Crawling</h3>
          </div>
          <div className="p-5 space-y-4">
            <TagListInput
              label="Sitemap URLs"
              values={sitemap}
              onChange={setSitemap}
              placeholder="Type a URL and press Enter"
            />
            <div className="space-y-1.5">
              <Label htmlFor="robotsTxt">robots.txt</Label>
              <Textarea
                id="robotsTxt"
                className="font-mono text-xs"
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-border shadow-sm md:col-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-neutral-800">
              Contact Info
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactAddress">Contact Address</Label>
              <Input
                id="contactAddress"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreSEOPage;
