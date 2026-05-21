import RecentStoreRow, { type StoreRowData } from "./RecentStoreRow";

interface RecentStoresPanelProps {
  stores: StoreRowData[];
  onViewAll: () => void;
}

function RecentStoresPanel({ stores, onViewAll }: RecentStoresPanelProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-semibold text-neutral-800">Recently Added Stores</h3>
        <button
          onClick={onViewAll}
          className="text-sm text-primary font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="divide-y divide-border">
        {stores.map((store) => (
          <RecentStoreRow key={store.id} store={store} />
        ))}
        {stores.length === 0 && (
          <div className="p-8 text-center text-sm text-neutral-500">
            No stores found.
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentStoresPanel;
