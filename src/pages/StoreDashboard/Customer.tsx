// src/pages/Admin/Customer.tsx
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useInfiniteCustomers } from "@/hooks/useCustomer";
import type { Customer } from "@/api/customer";

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMIT = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const formatDateShort = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const CustomerAvatar = ({ customer }: { customer: Customer }) => {
  const isRegistered = customer.customer_type === "registered";
  return (
    <div
      className={`w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm ${
        isRegistered
          ? "bg-primary text-primary-foreground"
          : "bg-neutral-200 text-neutral-600"
      }`}
    >
      {customer.customer_name?.charAt(0).toUpperCase() || "U"}
    </div>
  );
};

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: string }) => (
  <Badge
    variant="outline"
    className={
      type === "registered"
        ? "border-primary/30 text-primary bg-primary/10"
        : "border-neutral-200 text-neutral-600 bg-neutral-100/50"
    }
  >
    {type}
  </Badge>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────

const CustomerCard = ({ customer }: { customer: Customer }) => {
  const isRegistered = customer.customer_type === "registered";
  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${
              isRegistered
                ? "bg-primary/10 text-primary"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {isRegistered ? <UserCheck size={20} /> : <Users size={20} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-800 truncate">
              {customer.customer_name || "Unknown Customer"}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
              <Phone size={12} />
              <span className="truncate">{customer.phone || "No phone"}</span>
            </div>
          </div>
        </div>
        <TypeBadge type={customer.customer_type} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-neutral-50 p-2 border border-neutral-100">
          <p className="text-sm font-bold text-neutral-800">
            {customer.total_orders}
          </p>
          <p className="text-xs text-neutral-500 flex items-center justify-center gap-1 mt-0.5">
            <ShoppingBag size={10} /> Orders
          </p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-2 border border-neutral-100">
          <p className="text-xs font-semibold text-neutral-700 truncate">
            {formatDateShort(customer.last_order_date)}
          </p>
          <p className="text-xs text-neutral-500 flex items-center justify-center gap-1 mt-0.5">
            <Calendar size={10} /> Last Order
          </p>
        </div>
      </div>

      {customer.email && (
        <div className="flex items-center gap-2 text-xs text-neutral-600 bg-muted/30 p-2 rounded-lg border border-border">
          <Mail size={12} className="text-neutral-400" />
          <span className="truncate">{customer.email}</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerPage() {
  const { store_id } = useAdminStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCustomers({
    store_id: store_id ?? "",
    limit: LIMIT,
  });

  const customers = useMemo(() => {
    return data?.pages.flatMap((page) => page.customers) ?? [];
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;

  // ── Local search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.customer_name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customers, search]);

  // ── Summary counts (current page) ──
  const registeredCount = useMemo(
    () => customers.filter((c) => c.customer_type === "registered").length,
    [customers],
  );
  const totalOrdersPage = useMemo(
    () => customers.reduce((acc, c) => acc + c.total_orders, 0),
    [customers],
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.scrollHeight - target.scrollTop <= target.clientHeight + 200) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return (
    <div className="space-y-4">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-800">{total}</p>
            <p className="text-sm font-medium text-neutral-500">
              Total Customers
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-green-200 shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <UserCheck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-green-700">
              {registeredCount}
            </p>
            <p className="text-sm font-medium text-green-600/80">
              Registered (Page)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-orange-200 shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">
              {totalOrdersPage}
            </p>
            <p className="text-sm font-medium text-orange-500/80">
              Total Orders (Page)
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col h-[calc(100vh-270px)] sm:h-[calc(100vh-220px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <h2 className="text-base font-bold text-neutral-800">
              Customers Directory
            </h2>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="pl-9 h-10 w-full"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 flex-shrink-0 cursor-pointer"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                size={16}
                className={`text-neutral-600 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden sm:flex flex-col flex-1 min-h-0 bg-neutral-50/50">
          <div className="flex-1 overflow-auto" onScroll={handleScroll}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-neutral-700">
                    CUSTOMER
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    CONTACT
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700 text-center">
                    TYPE
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700 text-center">
                    ORDERS
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    FIRST ORDER
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-700">
                    LAST ORDER
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2
                          className="animate-spin text-primary"
                          size={28}
                        />
                        <p className="text-sm text-neutral-500">
                          Loading Customers...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((customer) => (
                    <TableRow
                      key={customer.id}
                      onClick={() => navigate(`/customer/${customer.id}`)}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <CustomerAvatar customer={customer} />
                          <div className="max-w-[180px]">
                            <p className="font-semibold text-neutral-800 truncate">
                              {customer.customer_name || "Unknown"}
                            </p>
                            {customer.user_id && (
                              <p className="text-xs text-neutral-500 font-mono">
                                UID: {customer.user_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-neutral-700">
                            <Phone size={14} className="text-neutral-400" />
                            {customer.phone || "-"}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                              <Mail size={13} className="text-neutral-400" />
                              <span
                                className="truncate max-w-[150px]"
                                title={customer.email}
                              >
                                {customer.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <TypeBadge type={customer.customer_type} />
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm border border-orange-200">
                          {customer.total_orders}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                          <Calendar size={14} className="text-neutral-400" />
                          {formatDate(customer.first_order_date)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-800">
                            {formatDate(customer.last_order_date)}
                          </span>
                          <span className="text-xs text-neutral-500">
                            Updated: {formatDateShort(customer.updated_at)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-neutral-400">
                        <Users size={32} className="mb-3 opacity-20" />
                        <p className="text-neutral-500 font-medium">
                          No customers found
                        </p>
                        {search && (
                          <p className="text-sm text-neutral-400 mt-1">
                            Try adjusting your search
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Mobile Cards ── */}
        <div
          className="sm:hidden flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((customer) => (
              <div
                key={customer.id}
                onClick={() => navigate(`/customer/${customer.id}`)}
                className="cursor-pointer"
              >
                <CustomerCard customer={customer} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No customers found.</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-t border-border bg-white rounded-b-xl">
          <p className="text-sm text-neutral-500">
            Showing{" "}
            <strong className="text-neutral-800">{filtered.length}</strong> of{" "}
            <strong className="text-neutral-800">{total}</strong> customers
            {isFetching && !isLoading && !isFetchingNextPage && (
              <span className="ml-2 text-xs text-primary">Updating...</span>
            )}
            {isFetchingNextPage && (
              <span className="ml-2 text-xs text-primary">Loading more...</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
