import { cn } from "@/shared/utils/cn";

const Button = ({
  onClick,
  children,
  size = "lg",
  className = "",
  variant = "primary",
  ...props
}) => {
  const variants = {
    neutral:   "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:!bg-gray-100 border border-gray-200",
    danger:    "bg-white text-red-600 hover:bg-red-50 disabled:!bg-white border border-red-200",
    primary:   "bg-brown-800 text-white hover:bg-brown-900 disabled:!bg-brown-800",
    outline:   "bg-white text-brown-800 border border-brown-200 hover:bg-brown-50 hover:border-brown-300 disabled:!bg-white",
    lightblue: "bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:!bg-blue-50 border border-blue-200",
  };

  const sizeClasses = {
    none: "",
    sm:   "h-8 px-3 text-xs",
    md:   "h-9 px-3 text-sm",
    lg:   "h-10 px-4 text-sm",
    xl:   "h-11 px-5 text-sm",
  };

  return (
    <button
      {...props}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
