import { STATUS_BADGE } from "../data/leads.data";

const LeadStatusBadge = ({ status }) => {
  const cfg = STATUS_BADGE[status] || {
    label: status,
    className: "bg-gray-50 text-gray-700 border border-gray-200",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

export default LeadStatusBadge;
