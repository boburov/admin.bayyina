// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Card - Basic container with optional title.
 * Flat design: border only, no shadow, small radius.
 */
const Card = ({
  children,
  title = "",
  icon = null,
  className = "",
  responsive = false,
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-border",
        responsive
          ? "xs:p-5"
          : "p-4 xs:p-5",
        className,
      )}
    >
      {title && (
        <div className="flex items-center gap-2 xs:gap-3 mb-3">
          {icon && icon}
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
