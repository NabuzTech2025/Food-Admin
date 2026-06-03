import {
  Store as StoreIcon,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface StoreRowData {
  id: string | number;
  name?: string;
  order: number;
  sales: number;
  status?: "open" | "close";
}

interface AllStoreRowProps {
  store: StoreRowData;
}

function AllStoreRow({ store }: AllStoreRowProps) {
  const isOpen = store.status === "open";
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/super/stores/${store.id}/store-profile`)}
      className="group h-full rounded-3xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl cursor-pointer"
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
            <StoreIcon className="h-6 w-6 text-orange-600" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {store.name || "Unnamed Store"}
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Store ID #{store.id}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <ShoppingBag size={16} />
            Orders
          </div>

          <p className="mt-3 text-2xl font-bold text-neutral-900">
            {store.order}
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <DollarSign size={16} />
            Revenue
          </div>

          <p className="mt-3 text-2xl font-bold text-green-600">
            €{store.sales}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AllStoreRow;
