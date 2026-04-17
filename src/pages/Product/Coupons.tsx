import { useState } from "react";
import { Search, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CouponsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col min-h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-neutral-800">
            Coupons List
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search coupons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Button
              className="flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-neutral-500">
          <Tag className="w-16 h-16 text-neutral-200 mb-4" />
          <p className="text-lg font-medium text-neutral-700 mb-2">Coupons / Promo Codes</p>
          <p className="text-sm max-w-md">
            Manage your store's promotional coupons here. You will be able to create discount codes, set validity periods, and configure usage limits.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CouponsPage;
