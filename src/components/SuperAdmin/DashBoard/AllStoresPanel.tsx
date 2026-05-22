import AllStoreRow, { type StoreRowData } from "./AllStoreRow";

interface AllStoresPanelProps {
  stores: StoreRowData[];
  onViewAll: () => void;
}

function AllStoresPanel({ stores, onViewAll }: AllStoresPanelProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-2">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            All Added Stores
          </h2>

          <p className="text-sm text-neutral-500">
            Manage and monitor all stores.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-5 overflow-x-auto p-6 scrollbar-hide">
        {stores.map((store) => (
          <div
            key={store.id}
            className="min-w-[320px] max-w-[320px] flex-shrink-0"
          >
            <AllStoreRow store={store} />
          </div>
        ))}

        {stores.length === 0 && (
          <div className="w-full py-16 text-center text-sm text-neutral-500">
            No stores found.
          </div>
        )}
      </div>
    </div>
  );
}

export default AllStoresPanel;
