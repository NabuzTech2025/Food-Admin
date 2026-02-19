// src/components/ui/SearchableSelect.tsx
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

interface SearchableSelectProps<T> {
  options: T[];
  value: string | number | null | undefined;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  clearable?: boolean;
  getOptionLabel?: (opt: T) => string;
  getOptionValue?: (opt: T) => string | number;
  error?: string;
}

function SearchableSelect<T>({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  required = false,
  clearable = true,
  getOptionLabel = (opt: any) => opt.name,
  getOptionValue = (opt: any) => opt.id,
  error,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: T) => {
    onChange(getOptionValue(opt));
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div ref={wrapperRef} className="relative">
        {/* Trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-md border bg-white cursor-pointer transition-colors ${
            error
              ? "border-destructive focus-within:ring-destructive"
              : "border-input hover:border-neutral-400"
          } ${isOpen ? "border-primary ring-1 ring-primary" : ""}`}
        >
          <span
            className={selectedOption ? "text-neutral-900" : "text-neutral-400"}
          >
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {clearable && selectedOption && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-input">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full text-sm px-2 py-1.5 rounded border border-input outline-none focus:border-primary"
              />
            </div>
            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={getOptionValue(opt)}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                      getOptionValue(opt) === value
                        ? "bg-primary-light text-primary font-medium"
                        : "hover:bg-muted text-neutral-700"
                    }`}
                  >
                    {getOptionLabel(opt)}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-neutral-400 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default SearchableSelect;
