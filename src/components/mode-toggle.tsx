import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const Icon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary hover:bg-primary-light dark:hover:bg-primary-light rounded-lg transition-colors duration-200 cursor-pointer">
          <Icon size={18} />
          <span className="hidden sm:inline capitalize">{theme}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "text-primary font-medium" : ""}
        >
          <Sun size={15} className="mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "text-primary font-medium" : ""}
        >
          <Moon size={15} className="mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "text-primary font-medium" : ""}
        >
          <Monitor size={15} className="mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
