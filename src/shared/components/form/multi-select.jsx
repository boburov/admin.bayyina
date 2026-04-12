// Multi-select component for selecting multiple classes
import { cn } from "@/shared/utils/cn";
import { X, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const MultiSelect = ({
  value = [],
  onChange,
  name = "",
  label = "",
  error = null,
  options = [],
  className = "",
  placeholder = "Tanlang...",
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== optionValue));
  };

  const getSelectedLabels = () => {
    return value.map((v) => {
      const option = options.find((opt) =>
        typeof opt === "object" ? opt.value === v : opt === v
      );
      return option ? (typeof option === "object" ? option.label : option) : v;
    });
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className={cn("text-left space-y-1.5", className)} ref={containerRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="ml-1 text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-blue-500">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full min-h-11 px-3 py-2 text-left bg-white border border-gray-300 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "flex items-center justify-between gap-2",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100",
            error && "border-red-500"
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => (
                <span
                  key={value[index]}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-sm bg-blue-100 text-blue-800 rounded-md"
                >
                  {label}
                  <X
                    className="size-3.5 cursor-pointer hover:text-blue-600"
                    onClick={(e) => handleRemove(value[index], e)}
                  />
                </span>
              ))
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-none max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Variantlar mavjud emas
              </div>
            ) : (
              options.map((opt) => {
                const optionValue = typeof opt === "object" ? opt.value : opt;
                const optionLabel = typeof opt === "object" ? opt.label : opt;
                const isSelected = value.includes(optionValue);

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleToggle(optionValue)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm flex items-center gap-2",
                      "hover:bg-gray-100 transition-colors",
                      isSelected && "bg-blue-50"
                    )}
                  >
                    <div
                      className={cn(
                        "size-4 rounded border flex items-center justify-center",
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      )}
                    >
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                    {optionLabel}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="ml-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default MultiSelect;
