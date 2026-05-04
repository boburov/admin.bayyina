// Hooks
import { useLeadSources } from "@/features/settings/hooks/useLeadSources";
import { useInterests }   from "@/features/settings/hooks/useInterests";

// Data
import { STATUS_OPTIONS } from "../data/leads.data";

// Icons
import { X } from "lucide-react";

// Shared components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

const LeadsFilters = ({ filters, onChange, onReset }) => {
  const hasFilters = filters.status || filters.source || filters.interest || filters.search;

  const { sources }   = useLeadSources();
  const { interests } = useInterests();

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full">
      {/* Search */}
      <div className="flex-1 min-w-[200px] w-full">
        <InputField
          name="search"
          placeholder="Ism yoki telefon qidirish..."
          value={filters.search || ""}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </div>

      {/* Status filter */}
      <SelectField
        name="status"
        options={STATUS_OPTIONS}
        value={filters.status || ""}
        onChange={(val) => onChange("status", val)}
        placeholder="Status"
        className="w-full sm:w-auto"
      />

      {/* Source filter */}
      <SelectField
        name="source"
        options={sources.map((s) => ({ value: s._id, label: s.label }))}
        value={filters.source || ""}
        onChange={(val) => onChange("source", val)}
        placeholder="Barcha manbalar"
        className="w-full sm:w-auto"
      />

      {/* Interest filter */}
      {interests.length > 0 && (
        <SelectField
          name="interest"
          options={interests.map((i) => ({ value: i._id, label: i.label }))}
          value={filters.interest || ""}
          onChange={(val) => onChange("interest", val)}
          placeholder="Barcha qiziqishlar"
          className="w-full sm:w-auto"
        />
      )}

      {/* Reset */}
      {hasFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          <X size={12} />
          Tozalash
        </Button>
      )}
    </div>
  );
};

export default LeadsFilters;
