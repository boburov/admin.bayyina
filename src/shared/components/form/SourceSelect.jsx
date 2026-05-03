import { useSelectOptions } from "@/shared/hooks/useSelectOptions";
import Select from "./select";

const SourceSelect = ({
  value,
  onChange,
  label     = "Manba",
  required  = false,
  size      = "lg",
  className = "",
}) => {
  const { options, isLoading } = useSelectOptions("lead_source");

  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      placeholder="Tanlang"
      required={required}
      size={size}
      className={className}
      isLoading={isLoading}
      options={options.map((o) => ({ value: o.value, label: o.label }))}
    />
  );
};

export default SourceSelect;
