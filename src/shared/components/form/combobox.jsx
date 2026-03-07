import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/shadcn/command";
import { cn } from "@/shared/utils/cn";

/**
 * Qidiruv imkoniyatiga ega Select komponenti (Combobox).
 * Select komponentining API'si bilan mos keladi.
 *
 * @param {object} props
 * @param {string} props.value - Tanlangan qiymat
 * @param {function} props.onChange - Qiymat o'zgarganda chaqiriladi (value: string)
 * @param {Array<{value: string, label: string}>} props.options - Variantlar ro'yxati
 * @param {string} [props.label] - Maydon yorlig'i
 * @param {string} [props.name] - input name atributi
 * @param {string} [props.placeholder] - Trigger placeholder matni
 * @param {string} [props.searchPlaceholder] - Qidiruv input placeholder
 * @param {string} [props.emptyText] - Hech narsa topilmasa ko'rsatiladigan matn
 * @param {"sm"|"md"|"lg"|"xl"} [props.size] - Trigger o'lchami
 * @param {"white"|"gray"|"gray-md"} [props.variant] - Fon varianti
 * @param {boolean} [props.required] - Majburiy maydon
 * @param {boolean} [props.disabled] - O'chirilgan holat
 * @param {boolean} [props.isLoading] - Yuklanmoqda holati
 * @param {boolean} [props.border] - Chegara ko'rsatish
 * @param {string} [props.className] - Root konteyner klasslari
 * @param {string} [props.triggerClassName] - Trigger klasslari
 * @returns {JSX.Element}
 */
const Combobox = ({
  value,
  onChange,
  options = [],
  label = "",
  name = "",
  placeholder = "Tanlang...",
  searchPlaceholder = "Qidirish...",
  emptyText = "Hech narsa topilmadi",
  size = "lg",
  variant = "white",
  required = false,
  disabled = false,
  isLoading = false,
  border = true,
  className = "",
  triggerClassName = "",
}) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  const variantClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    "gray-md": "bg-gray-100",
  };

  const sizeClasses = {
    sm: "h-9 px-2 rounded-sm",
    md: "h-10 px-3 rounded-md",
    lg: "h-11 px-3.5 rounded-lg",
    xl: "h-12 px-3.5 rounded-xl",
  };

  return (
    <div className={cn("text-left space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={name}
          className="ml-1 text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-blue-500">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={name}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "flex w-full items-center justify-between gap-1.5 text-sm",
              sizeClasses[size],
              variantClasses[variant],
              border ? "border border-gray-300" : "",
              "focus:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
              triggerClassName
            )}
          >
            <span
              className={cn(
                "truncate text-left",
                !selectedOption && "text-gray-400"
              )}
            >
              {isLoading
                ? "Yuklanmoqda..."
                : selectedOption
                  ? selectedOption.label
                  : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange?.(option.value === value ? "" : option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100 text-indigo-600" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Combobox;
