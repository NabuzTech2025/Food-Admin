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
import type { PhysicalExamOption } from "../Forms/Case/types/CreateCaseForm.type";

interface Subsection {
  name: string;
  options: PhysicalExamOption[];
}

interface PhysicalExamDropdownProps {
  availableOptions: PhysicalExamOption[];
  addedOptions: PhysicalExamOption[];
  onAddOption: (option: PhysicalExamOption) => void;
  onAddCustomOption: (value: string) => void;
  onAddAllFiltered: (options: PhysicalExamOption[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subsections?: Subsection[]; // Optional subsections for nested structure
}

export function PhysicalExamDropdown({
  availableOptions,
  addedOptions,
  onAddOption,
  onAddCustomOption,
  onAddAllFiltered,
  isOpen,
  onOpenChange,
  subsections,
}: PhysicalExamDropdownProps) {
  const [searchInput, setSearchInput] = useState("");

  // Filter options based on search input and exclude already added options
  const filteredOptions = availableOptions.filter(
    (option) =>
      !addedOptions.some((opt) => opt.value === option.value) &&
      option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  // Group filtered options by subsection if subsections exist
  const groupedOptions = subsections
    ? subsections
        .map((sub) => ({
          name: sub.name,
          options: filteredOptions.filter((opt) =>
            sub.options.some((subOpt) => subOpt.value === opt.value),
          ),
        }))
        .filter((group) => group.options.length > 0)
    : null;

  const handleAddAllClick = () => {
    if (filteredOptions.length > 0) {
      onAddAllFiltered(filteredOptions);
      setSearchInput("");
      onOpenChange(false);
    }
  };

  const handleAddCustomClick = () => {
    if (searchInput.trim()) {
      onAddCustomOption(searchInput.trim());
      setSearchInput("");
      onOpenChange(false);
    }
  };

  const handleSelectOption = (option: PhysicalExamOption) => {
    onAddOption(option);
    setSearchInput("");
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors border border-primary w-full justify-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Finding
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 ml-auto" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search findings..."
            value={searchInput}
            onValueChange={setSearchInput}
          />

          {/* Add All Button */}
          {filteredOptions.length > 0 && (
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

          {/* Render with subsection headers if subsections exist */}
          <div className="max-h-64 overflow-auto">
            {groupedOptions ? (
              // Nested structure with subsection headers
              groupedOptions.map((group) => (
                <CommandGroup key={group.name} heading={group.name}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelectOption(option)}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4 text-primary" />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              // Flat structure for non-nested sections
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelectOption(option)}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </div>

          {/* Empty State with Custom Option */}
          <CommandEmpty>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-2">No finding found.</p>
              {searchInput.trim() && (
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
