// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowLeft } from "lucide-react";

/**
 * BackHeader component
 * @param {className} className - Additional class names for the header
 * @param {href} href - The URL to navigate to when the back button is clicked (default: "-1" for going back in history)
 * @param {title} title - The title to display in the header
 */
const BackHeader = ({ className = "", href = "-1", title = "Sarlavha" }) => {
  return (
    <header
      className={cn(
        "flex items-center sticky inset-x-0 top-0 bg-white h-14 border-b border-border",
        className,
      )}
    >
      <div className="flex items-center gap-3 container">
        {/* Backlink */}
        <Link to={href} className="flex items-center justify-center size-10">
          <ArrowLeft strokeWidth={1.5} />
        </Link>

        {/* Title */}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
};

export default BackHeader;
