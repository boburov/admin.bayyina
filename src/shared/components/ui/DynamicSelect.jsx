import { useSelectOptions } from "@/shared/hooks/useSelectOptions";

/**
 * A select element driven by /select-options?type=X
 *
 * Props:
 *   type         — option type key (e.g. "lead_source", "entity_type")
 *   value        — controlled value
 *   onChange     — (value: string) => void
 *   allLabel     — text for the "all" option (e.g. "Barchasi"). Pass null to hide it.
 *   placeholder  — placeholder when no "all" option and nothing selected
 *   disabled     — bool
 *   className    — extra CSS classes for <select>
 */
const DynamicSelect = ({
  type,
  value = "",
  onChange,
  allLabel    = "Barchasi",
  placeholder = "Tanlang",
  disabled    = false,
  className   = "",
}) => {
  const { options, isLoading, isError } = useSelectOptions(type);

  // Loading skeleton — matches height of a normal select
  if (isLoading) {
    return (
      <div className={`h-9 rounded-md bg-gray-100 animate-pulse ${className}`} />
    );
  }

  // Error fallback
  if (isError) {
    return (
      <select
        disabled
        className={`py-2 px-3 text-sm border border-red-200 rounded-md bg-red-50 text-red-400 ${className}`}
      >
        <option>Yuklanmadi</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={`py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 ${className}`}
    >
      {allLabel !== null && (
        <option value="">{allLabel}</option>
      )}
      {allLabel === null && !value && (
        <option value="" disabled>{placeholder}</option>
      )}
      {options.map((o) => (
        <option key={o._id} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

export default DynamicSelect;
