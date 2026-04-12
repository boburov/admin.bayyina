import * as React from "react";

// Utils
import { cn } from "@/shared/utils/cn.js";

export const inputBaseClasses =
  "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors";

/**
 * Reusable styled input component with consistent styling across the application.
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes to apply
 * @param {string} [props.type] - HTML input type (text, email, password, etc.)
 * @param {React.Ref} ref - Forwarded ref to the input element
 * @returns {JSX.Element} Styled input element
 */
const Input = ({ className, type = "text", ...props }, ref) => {
  if (type === "textarea") {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(inputBaseClasses, "h-auto min-h-40 max-h-96", className)}
      />
    );
  }

  return (
    <input
      ref={ref}
      {...props}
      type={type}
      className={cn(inputBaseClasses, className)}
    />
  );
};

Input.displayName = "Input";

export default Input;
