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
  headerRight = null,
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
      {(title || headerRight) && (
        <div className="flex items-center justify-between gap-2 xs:gap-3 mb-3">
          <div className="flex items-center gap-2">
            {icon && icon}
            {title && <h2 className="text-sm font-semibold text-gray-900">{title}</h2>}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
