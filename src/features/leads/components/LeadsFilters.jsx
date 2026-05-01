// Hooks
import { useLeadSources } from "@/features/settings/hooks/useLeadSources";
import { useInterests }   from "@/features/settings/hooks/useInterests";

// Data
import { STATUS_OPTIONS } from "../data/leads.data";

// Icons
import { Search, X } from "lucide-react";

const LeadsFilters = ({ filters, onChange, onReset }) => {
  const hasFilters = filters.status || filters.source || filters.interest || filters.search;

  const { sources }   = useLeadSources();
  const { interests } = useInterests();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={filters.search || ""}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Ism yoki telefon qidirish..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status || ""}
        onChange={(e) => onChange("status", e.target.value)}
        className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Source filter */}
      <select
        value={filters.source || ""}
        onChange={(e) => onChange("source", e.target.value)}
        className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        <option value="">Barcha manbalar</option>
        {sources.map((s) => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>

      {/* Interest filter */}
      {interests.length > 0 && (
        <select
          value={filters.interest || ""}
          onChange={(e) => onChange("interest", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="">Barcha qiziqishlar</option>
          {interests.map((i) => (
            <option key={i._id} value={i._id}>{i.name}</option>
          ))}
        </select>
      )}

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2 py-2"
        >
          <X size={12} />
          Tozalash
        </button>
      )}
    </div>
  );
};

export default LeadsFilters;
