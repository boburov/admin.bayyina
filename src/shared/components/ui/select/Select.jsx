// Utils
import { cn } from "@/shared/utils/cn";

// Components
import {
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
  Select as SelectWrapper,
} from "@/shared/components/shadcn/select";

// Hooks
import useSound from "@/shared/hooks/useSound";

const Select = ({
  onChange,
  onOpenChange,
  options = [],
  isLoading = false,
  triggerClassName = "",
  ...props
}) => {
  const { playSound } = useSound();
  const handleChange = (e) => onChange?.(e);

  const handleOpenChange = (e) => {
    onOpenChange?.(e);
    playSound("notification-pop");
  };

  return (
    <SelectWrapper
      id={props.id || props.name}
      onValueChange={handleChange}
      name={props.name || props.id}
      onOpenChange={handleOpenChange}
      {...props}
    >
      {/* Trigger */}
      <SelectTrigger
        className={cn(
          "h-10 bg-white text-base outline-2 outline-primary md:text-sm",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>

      {/* Content */}
      <SelectContent>
        {/* Options */}
        {!isLoading &&
          options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-20">
            <div className="size-5 border-2 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </SelectContent>
    </SelectWrapper>
  );
};

export default Select;
