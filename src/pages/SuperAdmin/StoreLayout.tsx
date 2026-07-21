import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useGetStore } from "@/hooks/useStore";
import { useAdminStore } from "@/context/store/useAdminStore";
import {
  CreditCard,
  ChevronLeft,
  ChevronDown,
  X,
  Image,
  ListOrdered,
  Settings,
  Search,
  Scale,
  Landmark,
  ShoppingCart,
  Salad,
  Tag,
  LayoutGrid,
  Clock,
  MapPin,
  Map,
  Truck,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";

interface NavChild {
  name: string;
  link: string;
}

interface NavItem {
  name: string;
  icon: any;
  link: string;
  children?: NavChild[];
  section: string;
}

const SECTIONS = ["Operations"];

function StoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams();
  const [activeName, setActiveName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const { data: store, isLoading: storeLoading } = useGetStore(storeId);

  const base = `/super/stores/${storeId}`;

  // Store-scoped pages read store_id from the global admin store, so point
  // it at the browsed store while this layout is mounted, and restore it after.
  const setStoreId = useAdminStore((s) => s.setStoreId);
  const originalStoreId = useRef(useAdminStore.getState().store_id);

  useEffect(() => {
    if (storeId) setStoreId(Number(storeId));
    return () => setStoreId(originalStoreId.current);
  }, [storeId]);

  const navItems: NavItem[] = [
    {
      name: "Orders",
      icon: ListOrdered,
      link: `${base}/orders`,
      section: "Operations",
    },
    {
      name: "Reservations",
      icon: ListOrdered,
      link: `${base}/reservations`,
      section: "Operations",
    },
    {
      name: "Tax",
      icon: Landmark,
      link: `${base}/tax`,
      section: "Operations",
    },
    {
      name: "Product",
      icon: ShoppingCart,
      link: `${base}/product`,
      section: "Operations",
      children: [
        { name: "Category", link: `${base}/product/category` },
        { name: "Product", link: `${base}/product/products` },
        { name: "Toppings", link: `${base}/product/toppings` },
        { name: "Topping Groups", link: `${base}/product/topping-groups` },
        { name: "Group Item", link: `${base}/product/group-item` },
        {
          name: "Product-Variant Groups",
          link: `${base}/product/variant-groups`,
        },
      ],
    },
    {
      name: "Allergy",
      icon: Salad,
      link: `${base}/allergy`,
      section: "Operations",
      children: [
        { name: "Add Allergy", link: `${base}/allergy/add-allergy` },
        { name: "Item Allergy", link: `${base}/allergy/item-allergy` },
      ],
    },
    {
      name: "Coupons",
      icon: Tag,
      link: `${base}/coupons`,
      section: "Operations",
    },
    {
      name: "Category Availability Time",
      icon: LayoutGrid,
      link: `${base}/category`,
      section: "Operations",
    },
    {
      name: "Store Timing",
      icon: Clock,
      link: `${base}/store-timing`,
      section: "Operations",
    },
    {
      name: "Discount Manage",
      icon: Tag,
      link: `${base}/discount`,
      section: "Operations",
    },
    {
      name: "PostCode",
      icon: MapPin,
      link: `${base}/postcode`,
      section: "Operations",
    },
    {
      name: "Delivery Zone",
      icon: Map,
      link: `${base}/delivery-zone`,
      section: "Operations",
    },
    {
      name: "Delivery Time",
      icon: Truck,
      link: `${base}/delivery`,
      section: "Operations",
    },
    {
      name: "Customer",
      icon: Users,
      link: `${base}/customer`,
      section: "Operations",
    },
    {
      name: "Store Profile",
      icon: Image,
      link: `${base}/store-profile`,
      section: "Operations",
    },
    {
      name: "Payment Settings",
      icon: CreditCard,
      link: `${base}/payments`,
      section: "Operations",
    },
    {
      name: "SEO",
      icon: Search,
      link: `${base}/seo`,
      section: "Operations",
    },
    {
      name: "Legal Pages",
      icon: Scale,
      link: `${base}/legal-pages`,
      section: "Operations",
    },
    {
      name: "Settings",
      icon: Settings,
      link: `${base}/settings`,
      section: "Operations",
    },
  ];

  // Auto-detect active item + auto-open parent from URL
  useEffect(() => {
    // Check top-level items first
    const currentItem = navItems.find(
      (item) =>
        location.pathname === item.link ||
        (!item.children && location.pathname.startsWith(item.link + "/")),
    );

    if (currentItem) {
      setActiveName(currentItem.name);
      return;
    }

    // Check children
    for (const item of navItems) {
      if (item.children) {
        const activeChild = item.children.find(
          (c) =>
            location.pathname === c.link ||
            location.pathname.startsWith(c.link + "/"),
        );
        if (activeChild) {
          setActiveName(activeChild.name);
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
          return;
        }
      }
    }
  }, [location.pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isParentActive = (item: NavItem) =>
    location.pathname === item.link ||
    location.pathname.startsWith(item.link + "/");

  const handleNavClick = (item: NavItem) => {
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

  const initials = store?.name
    ? store.name.slice(0, 2).toUpperCase()
    : `S${storeId}`;

  return (
    <div className="h-screen w-screen flex bg-background overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0
          w-56 h-full z-40
          shadow-[8px_0_12px_-2px_rgba(0,0,0,0.15)]
          flex flex-col bg-component-bg
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Sidebar header — back button + store identity */}
        <div className="h-16 flex flex-col justify-center px-4 border-b border-border shrink-0 relative">
          <div className="flex items-center gap-2">
            {/* Store logo / initials */}
            <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
              {store?.image_url || store?.logo ? (
                <img
                  src={(store.image_url || store.logo)!.split("?")[0]}
                  alt={store?.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-primary font-semibold text-[11px]">
                  {storeLoading ? "..." : initials}
                </span>
              )}
            </div>

            {/* Store name + description */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {storeLoading
                  ? "Loading..."
                  : (store?.name ?? `Store #${storeId}`)}
              </p>
              {store?.description && (
                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          {/* Mobile close button */}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="cursor-pointer text-muted-foreground" size={20} />
          </button>
        </div>

        {/* Nav grouped by section */}
        <nav className="mt-2 px-2 overflow-y-auto flex-1 pb-4">
          {SECTIONS.map((section) => {
            const items = navItems.filter((i) => i.section === section);
            if (!items.length) return null;
            return (
              <div key={section} className="mb-1">
                {/* Section label */}
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium px-2.5 pt-3 pb-1">
                  {section}
                </p>

                {items.map((item, index) => (
                  <div key={index}>
                    {/* Nav item */}
                    <div
                      onClick={() => handleNavClick(item)}
                      className={`flex gap-2.5 items-center justify-between text-sm rounded-lg cursor-pointer px-2.5 py-2 font-semibold ${
                        isParentActive(item)
                          ? "bg-primary-light text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex gap-2.5 items-center">
                        <item.icon size={16} />
                        <span className="text-[13px]">{item.name}</span>
                      </div>
                      {item.children && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            openMenus[item.name] ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>

                    {/* Children */}
                    {item.children && openMenus[item.name] && (
                      <div className="ml-3 mt-1 mb-1 space-y-0.5 border-l-2 border-primary-light pl-3">
                        {item.children.map((child, ci) => (
                          <div
                            key={ci}
                            onClick={() => handleChildClick(child)}
                            className={`flex items-center gap-2 text-xs rounded-md cursor-pointer px-2 py-1.5 ${
                              location.pathname === child.link ||
                              location.pathname.startsWith(child.link + "/")
                                ? "text-primary font-semibold"
                                : "text-muted-foreground hover:text-primary hover:bg-primary-light/50"
                            }`}
                          >
                            <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                            <span>{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm ml-5 transition-colors mb-1.5 w-fit"
        >
          <ChevronLeft size={13} />
          Back to Stores
        </Button>
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

export default StoreLayout;
