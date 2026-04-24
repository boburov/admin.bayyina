// React
import * as React from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import { Slot } from "@radix-ui/react-slot";

// CVA
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brown-700 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:   "bg-brown-800 text-white hover:bg-brown-900",
        danger:    "bg-white text-red-600 border border-red-200 hover:bg-red-50",
        outline:   "border border-brown-200 bg-white text-brown-800 hover:bg-brown-50 hover:border-brown-300",
        secondary: "bg-brown-50 text-brown-800 border border-brown-200 hover:bg-brown-100",
        ghost:     "text-brown-800 hover:bg-brown-50 hover:text-brown-900",
        link:      "text-brown-800 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:      "h-8 px-3 text-xs",
        lg:      "h-10 px-5",
        icon:    "size-9",
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
