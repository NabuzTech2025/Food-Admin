import Header from "@/components/Header";
import { useAdminStore } from "@/context/store/useAdminStore";
import { Home, Landmark, ShoppingCart, X, ChevronDown } from "lucide-react";
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

  const { role_id } = useAdminStore();

  const navItems: NavItem[] =
    role_id === 1
      ? [{ name: "Dashboard", icon: Home, link: "/admin/dashboard" }]
      : [
          { name: "Dashboard", icon: Home, link: "/admin/dashboard" },
          { name: "Tax", icon: Landmark, link: "/admin/tax" },
          {
            name: "Product",
            icon: ShoppingCart,
            link: "/admin/product",
            children: [
              { name: "Category", link: "/admin/product/category" },
              { name: "Product", link: "/admin/product/products" },
              { name: "Toppings", link: "/admin/product/toppings" },
              { name: "Topping Groups", link: "/admin/product/topping-groups" },
              { name: "Group Item", link: "/admin/product/group-item" },
              {
                name: "Product-Variant Groups",
                link: "/admin/product/variant-groups",
              },
            ],
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
        className={`
          fixed lg:static inset-y-0 left-0
          w-56 h-full z-40
          shadow-[8px_0_12px_-2px_rgba(0,0,0,0.2)]
          flex flex-col bg-white
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center relative flex-shrink-0 border-b border-gray-100">
          {role_id === 1 ? (
            <img src="/super-admin-logo.png" alt="" className="w-80" />
          ) : (
            <h1 className="font-semibold text-primary">Store Name</h1>
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
                <div className="flex gap-3 items-center">
                  <item.icon size={20} />
                  <span className="text-[15px]">{item.name}</span>
                </div>
                {item.children && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
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
                      <span>{child.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
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
