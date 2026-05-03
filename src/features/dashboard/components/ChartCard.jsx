// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowUpRight } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

const ChartCard = ({
  accent,
  icon: Icon,
  iconBg,
  title,
  linkTo,
  linkLabel,
  loading,
  children,
}) => (
  <Card className="flex flex-col relative overflow-hidden h-48 sm:h-64">
    {/* Top line */}
    <div className={cn("absolute inset-x-0 top-0 h-0.5", accent)} />

    {/* Top */}
    <div className="flex items-center justify-between mb-4">
      {/* Icon & tile */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "hidden items-center justify-center w-8 h-8 rounded-xl sm:flex",
            iconBg,
          )}
        >
          <Icon size={15} strokeWidth={2} />
        </div>

        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>

      {/* Link */}
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-0.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          {linkLabel ?? "Ba'tafsil"}
          <ArrowUpRight size={12} strokeWidth={2} />
        </Link>
      )}
    </div>

    {/* Skeleton */}
    <div className="flex-1 min-h-0">
      {loading ? <Skeleton className="size-full" /> : children}
    </div>
  </Card>
);

export default ChartCard;
