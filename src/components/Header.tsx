import { Input } from "@/components/ui/input";
import { Search, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAdminStore } from "@/context/store/useAdminStore";
import { useNavigate } from "react-router-dom";

function Header({
  name,
  children,
  onMenuClick,
}: {
  name: string;
  children?: React.ReactNode;
  onMenuClick?: () => void;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const clearAdminData = useAdminStore((state) => state.clearAdminData);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminData();
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="min-h-16 dark:bg-primary border-b border-gray-200 shadow-lg flex items-center justify-between px-4 gap-3">
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-1 text-neutral-600 hover:text-neutral-800 flex-shrink-0"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <h1
          className={`text-base font-semibold whitespace-nowrap text-neutral-700 ${
            showSearch ? "hidden sm:block" : "block"
          }`}
        >
          {name}
        </h1>

        {/* Search input */}
        <div
          className={`transition-all duration-200 ${
            showSearch ? "flex flex-1" : "hidden sm:flex"
          }`}
        >
          <Input
            placeholder="Type to search..."
            className="w-full sm:w-72 lg:w-90"
            autoFocus={showSearch}
            onBlur={() => setShowSearch(false)}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search icon — mobile only */}
        <button
          className="sm:hidden p-2 text-neutral-500 hover:text-neutral-700"
          onClick={() => setShowSearch((prev) => !prev)}
        >
          <Search size={20} />
        </button>

        {children}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Header;
