import Header from "@/components/Header";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useCurrentStore } from "@/hooks/useCurrentStore";
import {
  Home,
  Landmark,
  ShoppingCart,
  X,
  ChevronDown,
  Salad,
  LayoutGrid,
  Settings2,
  Tag,
  MapPin,
  Package,
  Truck,
  Users,
  Map,
  ListOrdered,
  CreditCard,
  Clock,
  MonitorSmartphone,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

interface NavChild {
  name: string;
  link: string;
}

interface NavItem {
  name: string;
  icon: any;
  link: string;
  children?: NavChild[];
}

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeName, setActiveName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const { role_id, store_id, storeData } = useAdminStore();

  useCurrentStore(store_id);

  // ─── Resizable sidebar ───────────────────────────────────────────
  const DEFAULT_WIDTH = role_id === 1 ? 192 : 288;
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(Math.max(e.clientX, 160), 400);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  // ────────────────────────────────────────────────────────────────

  const navItems: NavItem[] =
    role_id === 1
      ? [
          { name: "Dashboard", icon: Home, link: "/super/dashboard" },
          { name: "Store Details", icon: MapPin, link: "/super/store-details" },
          {
            name: "Store Config",
            icon: Settings2,
            link: "/super/store-config",
          },
          {
            name: "Reservations",
            icon: ListOrdered,
            link: "/super/reservations",
          },
          {
            name: "Device Status",
            icon: MonitorSmartphone,
            link: "/super/device-status",
          },
        ]
      : [
          { name: "Dashboard", icon: Home, link: "/dashboard" },
          { name: "Orders", icon: ListOrdered, link: "/orders" },
          { name: "Reservations", icon: ListOrdered, link: "/reservations" },
          { name: "Tax", icon: Landmark, link: "/tax" },
          {
            name: "Product",
            icon: ShoppingCart,
            link: "/product",
            children: [
              { name: "Category", link: "/product/category" },
              { name: "Product", link: "/product/products" },
              { name: "Toppings", link: "/product/toppings" },
              { name: "Topping Groups", link: "/product/topping-groups" },
              { name: "Group Item", link: "/product/group-item" },
              {
                name: "Product-Variant Groups",
                link: "/product/variant-groups",
              },
            ],
          },
          {
            name: "Allergy",
            icon: Salad,
            link: "/allergy",
            children: [
              { name: "Add Allergy", link: "/allergy/add-allergy" },
              { name: "Item Allergy", link: "/allergy/item-allergy" },
            ],
          },
          {
            name: "Coupons",
            icon: Tag,
            link: "/coupons",
          },
          {
            name: "Category Availability Time",
            icon: LayoutGrid,
            link: "/category",
          },
          {
            name: "Store Timing",
            icon: Clock,
            link: "/store-timing",
          },
          {
            name: "Store Settings",
            icon: Settings2,
            link: "/store-settings",
          },
          {
            name: "Discount Manage",
            icon: Tag,
            link: "/discount",
          },
          {
            name: "PostCode",
            icon: MapPin,
            link: "/postcode",
          },
          {
            name: "Delivery Zone",
            icon: Map,
            link: "/delivery-zone",
          },
          {
            name: "Delivery Time",
            icon: Truck,
            link: "/delivery",
          },
          {
            name: "Customer",
            icon: Users,
            link: "/customer",
          },
          {
            name: "Payment Settings",
            icon: CreditCard,
            link: "/payment-settings",
          },
          {
            name: "Change Password",
            icon: Package,
            link: "/change-password",
          },
        ];

  // Auto-open parent if a child route is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          location.pathname.startsWith(child.link),
        );
        if (isChildActive) {
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });

    const currentItem = navItems.find(
      (item) =>
        location.pathname === item.link ||
        location.pathname.startsWith(item.link + "/"),
    );
    if (currentItem) {
      setActiveName(currentItem.name);
    }
  }, [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNavClick = (item: NavItem, index: number) => {
    if (item.children) {
      toggleMenu(item.name);
    } else {
      setActiveName(item.name);
      navigate(item.link);
    }
  };

  const handleChildClick = (child: NavChild) => {
    setActiveName(child.name);
    navigate(child.link);
  };

  const isParentActive = (item: NavItem) =>
    location.pathname === item.link ||
    location.pathname.startsWith(item.link + "/");

  return (
    <div className="h-screen w-screen flex dark:bg-primary overflow-hidden relative">
      {/* Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className={`
          fixed lg:static inset-y-0 left-0
          h-full z-40 relative
          shadow-[8px_0_12px_-2px_rgba(0,0,0,0.2)]
          flex flex-col bg-white flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center relative flex-shrink-0 border-b border-gray-100">
          {role_id === 1 ? (
            <img
              src="https://magskrimages.s3.amazonaws.com/8f571a772d28460aa66fd448f47eb55f.png"
              alt=""
              className="w-36"
            />
          ) : (
            <>
              <img src={storeData?.image_url} alt="" className="w-24" />
              {!storeData?.image_url && (
                <h1 className="font-semibold text-primary pl-5 truncate px-4">
                  {storeData?.name}
                </h1>
              )}
            </>
          )}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="cursor-pointer text-neutral-600" size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-3 px-2 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item, index) => (
            <div key={index}>
              <div
                ref={(el) => {
                  navRefs.current[index] = el;
                }}
                onClick={() => handleNavClick(item, index)}
                className={`flex gap-3 items-center justify-between text-sm font-semibold rounded-lg cursor-pointer p-2.5 ${
                  isParentActive(item)
                    ? "bg-primary-light text-primary"
                    : "text-neutral-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex gap-3 items-center min-w-0">
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="text-[15px] truncate">{item.name}</span>
                </div>
                {item.children && (
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      openMenus[item.name] ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {/* Children */}
              {item.children && openMenus[item.name] && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-light pl-3">
                  {item.children.map((child, childIndex) => (
                    <div
                      key={childIndex}
                      onClick={() => handleChildClick(child)}
                      className={`flex items-center gap-2 text-sm rounded-md cursor-pointer px-2 py-2 ${
                        location.pathname === child.link ||
                        location.pathname.startsWith(child.link + "/")
                          ? "text-primary font-semibold"
                          : "text-neutral-500 hover:text-primary hover:bg-primary-light/50"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      <span className="truncate">{child.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize group z-50 hidden lg:block"
        >
          <div className="h-full w-full bg-transparent group-hover:bg-primary/30 transition-colors duration-150" />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-off-bg min-w-0">
        <Header name={activeName} onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 md:p-5 overflow-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
