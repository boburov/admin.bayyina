// Utils
import { cn } from "@/shared/utils/cn";

// React mask
import { IMaskInput } from "react-imask";

// Components
import { inputBaseClasses } from "./Input";

/**
 * Masked telephone input that emits event-like payload for form handlers.
 * @param {{className?: string, onChange?: function, name?: string, value?: string}} props
 * @returns {JSX.Element}
 */
const InputTel = ({ className = "", onChange, name, ...props }) => {
  const handleAccept = (value) => {
    if (!onChange) return;
    onChange({ target: { name, value } });
  };

  return (
    <IMaskInput
      type="tel"
      name={name}
      placeholder="+998 "
      value={props.value}
      onAccept={handleAccept}
      mask="+{998} (00) 000-00-00"
      className={cn(className, inputBaseClasses)}
      {...props}
    />
  );
};

export default InputTel;
