// React
import * as React from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import { Slot } from "@radix-ui/react-slot";

// CVA
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "flex items-center justify-center gap-3 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85",
        outline:
          "border border-border bg-white text-foreground hover:bg-accent hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-text-foreground border border-border hover:bg-accent",
        ghost: "hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "size-10",
        default: "h-10 px-4 py-2",
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
