import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  // Trigger button props
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;

  // Dropdown props
  placeholder?: string;
  emptyMessage?: string;

  // Options
  availableOptions: DropdownOption[];
  addedOptions: DropdownOption[];

  // Callbacks
  onAddOption: (option: DropdownOption) => void;
  onAddCustomOption?: (value: string) => void;
  onAddAllFiltered?: (options: DropdownOption[]) => void;

  // Control
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Customization
  showAddAllButton?: boolean;
  allowCustomOptions?: boolean;
  popoverWidth?: string;
  maxHeight?: string;
}

function SearchableDropdown({
  triggerLabel = "Add Item",
  triggerIcon = <Plus className="w-3.5 h-3.5" />,
  triggerClassName = "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors border border-primary",
  placeholder = "Search...",
  emptyMessage = "No items found.",
  availableOptions,
  addedOptions,
  onAddOption,
  onAddCustomOption,
  onAddAllFiltered,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showAddAllButton = true,
  allowCustomOptions = true,
  popoverWidth = "w-[300px]",
  maxHeight = "max-h-64",
}: SearchableDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  // Filter options based on search input and exclude already added options
  const getFilteredOptions = () => {
    return availableOptions.filter(
      (option) =>
        !addedOptions.some((opt) => opt.value === option.value) &&
        option.label.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const filteredOptions = getFilteredOptions();

  const handleAddAllClick = () => {
    if (onAddAllFiltered && filteredOptions.length > 0) {
      onAddAllFiltered(filteredOptions);
      setSearchInput("");
      setIsOpen(false);
    }
  };

  const handleAddCustomClick = () => {
    if (onAddCustomOption && searchInput.trim()) {
      onAddCustomOption(searchInput.trim());
      setSearchInput("");
      setIsOpen(false);
    }
  };

  const handleSelectOption = (option: DropdownOption) => {
    onAddOption(option);
    setSearchInput("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClassName}>
          {triggerIcon}
          {triggerLabel}
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={`${popoverWidth} p-0`} align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchInput}
            onValueChange={setSearchInput}
          />

          {/* Add All Button */}
          {showAddAllButton &&
            filteredOptions.length > 0 &&
            onAddAllFiltered && (
              <div className="p-2 border-b border-gray-200">
                <Button
                  type="button"
                  onClick={handleAddAllClick}
                  className="w-full h-8 text-xs bg-primary hover:bg-primary-dark text-white"
                  size="sm"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Add All & Select ({filteredOptions.length})
                </Button>
              </div>
            )}

          {/* Filtered Options List */}
          <CommandGroup className={`${maxHeight} overflow-auto`}>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => handleSelectOption(option)}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4 opacity-0" />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Empty State with Custom Option */}
          <CommandEmpty>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-2">{emptyMessage}</p>
              {allowCustomOptions &&
                onAddCustomOption &&
                searchInput.trim() && (
                  <Button
                    type="button"
                    onClick={handleAddCustomClick}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add "{searchInput}"
                  </Button>
                )}
            </div>
          </CommandEmpty>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { SearchableDropdown };
