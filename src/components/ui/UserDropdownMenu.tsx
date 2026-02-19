import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useGetCurrentUser from "@/hooks/Common/useGetCurrentUser";
import { removeLocalStorage } from "@/utils/storage";
import type { storageKey } from "@/types/Educator.types";

const UserDropdownMenu = () => {
  const { user, isLoading, clearUser } = useGetCurrentUser();
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // No user state
  if (!user) {
    return null;
  }

  const currentUser = {
    name: user.profile.name || "User Name",
    email: user.email,
    role: user.userType,
  };

  const handleLogout = () => {
    console.log("Starting logout process...");
    const key = `${
      currentUser.role === "EDUCATOR" ? "Educator" : "Individual"
    }Data` as storageKey;
    removeLocalStorage(key);
    // Step 1: Clear React Query cache FIRST
    clearUser();
    // Step 3: Show success message
    toast.success("Logged out successfully");
    // Step 4: Force full page reload to ensure clean state
    window.location.href = "/user-login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors duration-200">
          <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
            <AvatarImage src="/user.png" alt={currentUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {currentUser.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser.email}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
        {/* User Info Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
              <AvatarImage src="/user.png" alt={currentUser.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">
                  {currentUser.name}
                </h3>
                {user.isVerified && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                  >
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {currentUser.email}
              </p>
              <Badge
                variant="secondary"
                className="mt-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                {currentUser.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="py-2">
          <DropdownMenuLabel className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              if (currentUser.role === "EDUCATOR") {
                navigate("/educator/profile");
              } else if (currentUser.role === "INDIVIDUAL") {
                navigate("/individual/profile");
              }
            }}
            className="px-4 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Profile
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Manage your profile settings
              </span>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="py-2">
          <DropdownMenuItem
            onClick={handleLogout}
            className="px-4 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
