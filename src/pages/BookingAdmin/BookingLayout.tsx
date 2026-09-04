import Header from "@/components/Header";
import {
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  Package,
  Settings,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "dashboard" },
  { name: "Bookings", icon: CalendarCheck, to: "bookings" },
  { name: "Services", icon: Package, to: "services" },
  { name: "Create Booking", icon: PlusCircle, to: "create" },
  { name: "Settings", icon: Settings, to: "settings" },
];

function BookingLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const activeName =
    navItems.find((i) => pathname.endsWith(`/${i.to}`))?.name || "Bookings";

  return (
    <div className="h-screen w-screen flex bg-off-bg overflow-hidden relative">
      {/* Sidebar — off-canvas drawer on mobile, static on lg+ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 z-40 shrink-0 bg-component-bg border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border relative">
          <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <Ticket size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">Bookings</p>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon size={19} className="shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header name={activeName} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default BookingLayout;
