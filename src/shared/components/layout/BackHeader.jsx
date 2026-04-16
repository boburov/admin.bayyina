// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

const BackHeader = ({ className = "", href = "-1", title = "Sarlavha" }) => {
  return (
    <header
      className={cn(
        "flex items-center sticky inset-x-0 top-0 bg-white h-11 border-b border-border z-10",
        className,
      )}
    >
      <div className="flex items-center gap-3 container">
        <Link
          to={href}
          className="flex items-center justify-center w-7 h-7 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  );
};

export default BackHeader;
