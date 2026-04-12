// Lottie
import Lottie from "lottie-react";

// Icons
import { Loader } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Animations
import magicAnimation from "@/shared/assets/animations/magic.json";

/**
 * LoaderCard
 * @param {string} [props.className=""] - Extra class names.
 * @param {"lottie"|"icon"} [props.kind="lottie"] - Type of loader to display.
 * @param {boolean} [props.animated=true] - Whether the icon should be animated (only for "icon" kind).
 * @param {React.Component} [props.icon=Loader] - Icon component to display when kind is "icon".
 * @param {string} [props.title="Yuklanmoqda..."] - Text to display below the loader.
 * @param {object} [props.iconProps={ className: "size-6 text-gray-400" }] - Additional props for the icon component.
 * @returns {JSX.Element}
 */
const LoaderCard = ({
  className = "",
  kind = "lottie",
  animated = true,
  icon: Icon = Loader,
  title = "Yuklanmoqda...",
  iconProps = { className: "size-6 text-gray-400" },
  ...props
}) => {
  // Lottie animation
  if (kind === "lottie") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3.5 bg-white p-4 rounded-lg border border-border xs:p-5",
          className,
        )}
        {...props}
      >
        <Lottie animationData={magicAnimation} className="size-9" />
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    );
  }

  // Icon
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3.5 bg-white p-4 rounded-lg border border-border xs:p-5",
        className,
      )}
      {...props}
    >
      <Icon
        {...iconProps}
        className={cn(animated ? "animate-spin" : "", iconProps.className)}
      />
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
};

export default LoaderCard;
