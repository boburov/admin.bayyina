// React
import * as React from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import { Slot } from "@radix-ui/react-slot";

// CVA
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7c5c3e] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#7c5c3e] text-white hover:bg-[#6b4f34]",
        danger:
          "bg-white text-red-600 border border-red-200 hover:bg-red-50",
        outline:
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        secondary:
          "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link: "text-[#7c5c3e] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "size-9",
        default: "h-9 px-4 py-2",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
