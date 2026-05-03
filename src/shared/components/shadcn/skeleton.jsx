import { cn } from "@/shared/utils/cn"

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("animate-pulse rounded-sm bg-gray-100", className)} {...props} />);
}

export { Skeleton }
