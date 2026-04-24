// React
import { useState } from "react";

// Icons
import { Eye, EyeOff } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Input Mask
import { InputMask } from "@react-input/mask";

const Input = ({
  value,
  onChange,
  name = "",
  size = "lg",
  label = "",
  type = "text",
  border = true,
  className = "",
  placeholder = "",
  required = false,
  disabled = false,
  variant = "white",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const variantClasses = {
    white:    "bg-white",
    gray:     "bg-gray-50",
    "gray-md": "bg-gray-100",
  };

  const sizeClasses = {
    sm: "h-8  px-2.5 text-xs",
    md: "h-9  px-3   text-sm",
    lg: "h-10 px-3   text-sm",
    xl: "h-11 px-3.5 text-sm",
  };

  const baseClasses = cn(
    "w-full rounded-sm transition-colors outline-none",
    border ? "border border-gray-300 focus:border-brown-800" : "border-0 focus:outline-none",
    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
  );

  const handleChange = (e) => {
    onChange?.(type === "file" ? e.target.files : e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const RenderInput = (() => {
    if (type === "textarea") {
      return (
        <textarea
          id={name}
          {...props}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            variantClasses[variant],
            baseClasses,
            sizeClasses[size],
            "h-auto py-2 min-h-24 max-h-48",
          )}
        />
      );
    }

    if (type === "tel") {
      return (
        <InputMask
          id={name}
          type="tel"
          {...props}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholder}
          replacement={{ _: /\d/ }}
          mask="+___ (__) ___-__-__"
          className={cn(
            variantClasses[variant],
            baseClasses,
            sizeClasses[size],
          )}
        />
      );
    }

    if (type === "password") {
      return (
        <div className="relative">
          <input
            id={name}
            {...props}
            type={showPassword ? "text" : "password"}
            name={name}
            value={value}
            required={required}
            disabled={disabled}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              variantClasses[variant],
              baseClasses,
              sizeClasses[size],
              "pr-10",
            )}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    }

    return (
      <input
        id={name}
        {...props}
        type={type}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          variantClasses[variant],
          baseClasses,
          sizeClasses[size],
        )}
      />
    );
  })();

  return (
    <div className={cn("text-left space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-brown-800">*</span>}
        </label>
      )}
      {RenderInput}
    </div>
  );
};

export default Input;
