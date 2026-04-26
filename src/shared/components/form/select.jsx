// UI components
import {
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
  Select as SelectWrapper,
} from "@/shared/components/shadcn/select";
import { cn } from "@/shared/utils/cn";

// Radix Select forbids value="". Use this sentinel internally for "clear" options.
const CLEAR_SENTINEL = "__CLEAR__";

const normaliseValue = (v) => (v === "" ? CLEAR_SENTINEL : v);
const externalValue  = (v) => (v === CLEAR_SENTINEL ? "" : v);

const Select = ({
  value,
  onChange,
  name = "",
  label = "",
  size = "lg",
  error = null,
  options = [],
  border = true,
  className = "",
  placeholder = "",
  required = false,
  disabled = false,
  isLoading = false,
  variant = "white",
  triggerClassName = "",
  onOpenChange = () => {},
  ...props
}) => {
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

  const defaultClasses = cn(
    border ? "border border-gray-300" : "-outline-offset-1",
    "w-full focus:outline-blue-500"
  );

  const handleChange = (v) => onChange?.(externalValue(v));

  const resolvedValue = value === "" ? CLEAR_SENTINEL : value;

  return (
    <div className={cn("ext-left space-y-1.5", className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="ml-1 text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-blue-500">*</span>}
        </label>
      )}

      {/* Select */}
      <SelectWrapper
        id={name}
        name={name}
        value={resolvedValue}
        required={required}
        disabled={disabled}
        onOpenChange={onOpenChange}
        onValueChange={handleChange}
        {...props}
      >
        <SelectTrigger
          className={cn(
            sizeClasses[size],
            variantClasses[variant],
            defaultClasses,
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Options */}
          {!isLoading &&
            options.map((opt) => {
              if (typeof opt === "object") {
                const safeValue = normaliseValue(opt.value);
                return (
                  <SelectItem key={safeValue} value={safeValue} disabled={opt.disabled}>
                    {opt.label}
                  </SelectItem>
                );
              }
              return (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              );
            })}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center h-20">
              <div className="spin-loader size-5" />
            </div>
          )}
        </SelectContent>
      </SelectWrapper>
    </div>
  );
};

export default Select;
