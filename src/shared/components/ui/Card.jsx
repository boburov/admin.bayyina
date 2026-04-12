// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Card - Basic container with optional title.
 *
 * @param {object} props
 * @param {string} [props.className=""] - Extra class names.
 * @param {React.ReactNode} props.children - Card content.
 * @param {boolean} [props.responsive=false] - Apply responsive padding/rounding.
 * @param {string} [props.title=""] - Optional title text.
 * @param {React.ElementType} [props.icon=null] - Optional icon component for title.
 * @returns {JSX.Element}
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
        responsive
          ? "xs:p-5 xs:rounded-lg xs:bg-white xs:border xs:border-border"
          : "bg-white p-4 rounded-lg border border-border xs:p-5",
        className,
      )}
    >
      {title && (
        <div className="flex items-center gap-1.5 xs:gap-3.5">
          {icon && icon}
          <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
