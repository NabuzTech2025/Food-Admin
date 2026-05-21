import { Store, MapPin, Calendar } from "lucide-react";

export interface StoreRowData {
  id: string | number;
  name?: string;
  address?: string;
  logo?: string;
  image_url?: string;
  manual_status?: string | null;
  created_at?: string;
}

interface RecentStoreRowProps {
  store: StoreRowData;
}

function RecentStoreRow({ store }: RecentStoreRowProps) {
  const logoSrc = store.logo || store.image_url;
  const statusStyle =
    store.manual_status === "open"
      ? "bg-green-100 text-green-700"
      : store.manual_status === "close"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

  return (
    <div className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
          {logoSrc ? (
            <img
              src={logoSrc.split("?")[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Store size={18} className="text-neutral-400" />
          )}
        </div>
        <div>
          <h4 className="font-medium text-sm text-neutral-800">
            {store.name || "Unnamed"}
          </h4>
          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {store.address || "No Address"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${statusStyle}`}
        >
          {store.manual_status || "UNKNOWN"}
        </span>
        <span className="text-xs text-neutral-400 flex items-center gap-1">
          <Calendar size={12} />
          {store.created_at
            ? new Date(store.created_at).toLocaleDateString()
            : "N/A"}
        </span>
      </div>
    </div>
  );
}

export default RecentStoreRow;
