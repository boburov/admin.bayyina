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
    white: "bg-white",
    gray: "bg-gray-50",
    "gray-md": "bg-gray-100",
  };

  const sizeClasses = {
    sm: "h-9 px-2 rounded-sm",
    md: "h-10 px-3 rounded-md",
    lg: "h-11 px-3.5 rounded-lg",
    xl: "h-12 px-3.5 rounded-xl",
  };

  const defaultClasses = cn(
    border ? "border border-gray-300" : "-outline-offset-1",
    "w-full focus:outline-blue-500",
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
            defaultClasses,
            sizeClasses[size],
            "h-auto py-1.5 min-h-24 max-h-48",
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
            defaultClasses,
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
              defaultClasses,
              sizeClasses[size],
              "pr-10",
            )}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
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
          defaultClasses,
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
          className="ml-1 text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-blue-500">*</span>}
        </label>
      )}

      {RenderInput}
    </div>
  );
};

export default Input;
