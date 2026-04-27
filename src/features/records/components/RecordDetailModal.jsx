// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button          from "@/shared/components/ui/button/Button";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Data
import {
  eventTypeLabel,
  entityTypeLabel,
  actorRoleLabel,
} from "@/features/records/data/records.data";

const RecordDetailModal = () => (
  <ResponsiveModal name="recordDetail" title="Hodisa tafsilotlari" className="max-w-lg">
    <Content />
  </ResponsiveModal>
);

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

const Content = ({ close, ...record }) => {
  if (!record?._id) return null;

  const refs = record.refs ?? {};
  const refEntries = [
    { label: "Murojaat",        value: refs.leadId       },
    { label: "O'quvchi",        value: refs.studentId    },
    { label: "O'qituvchi",      value: refs.teacherId    },
    { label: "Guruh",           value: refs.groupId      },
    { label: "Ro'yxatga olish", value: refs.enrollmentId },
    { label: "To'lov",          value: refs.paymentId    },
    { label: "Davomat",         value: refs.attendanceId },
    { label: "Maosh",           value: refs.salaryId     },
  ].filter((e) => e.value);

  const changes = record.changes;
  const hasChanges = changes?.before != null || changes?.after != null;

  return (
    <div className="space-y-5">
      {/* Main info */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Kod">
          <span className="font-mono text-xs">{record.code}</span>
        </Field>
        <Field label="Sana">{formatUzDate(record.createdAt)}</Field>
        <Field label="Hodisa turi">
          {eventTypeLabel[record.eventType] ?? record.eventType}
        </Field>
        <Field label="Obyekt turi">
          {entityTypeLabel[record.entityType] ?? record.entityType}
        </Field>
      </div>

      {/* Description */}
      <Field label="Tavsif">
        <p className="text-sm leading-relaxed">{record.description}</p>
      </Field>

      {/* Actor */}
      <Field label="Bajaruvchi">
        <p className="font-medium">{record.actor?.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">
          {actorRoleLabel[record.actor?.role] ?? record.actor?.role}
        </p>
      </Field>

      {/* Refs */}
      {refEntries.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Bog'liq obyektlar</p>
          <div className="space-y-1.5 border border-border p-3">
            {refEntries.map((e) => (
              <div key={e.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground shrink-0">{e.label}</span>
                <span className="font-mono text-xs text-foreground truncate">{String(e.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changes */}
      {hasChanges && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">O'zgarishlar</p>
          <div className="grid grid-cols-2 gap-2">
            {changes.before != null && (
              <div className="border border-border p-2">
                <p className="text-xs text-muted-foreground mb-1">Oldin</p>
                <pre className="text-xs text-foreground whitespace-pre-wrap break-all">
                  {JSON.stringify(changes.before, null, 2)}
                </pre>
              </div>
            )}
            {changes.after != null && (
              <div className="border border-border p-2">
                <p className="text-xs text-muted-foreground mb-1">Keyin</p>
                <pre className="text-xs text-foreground whitespace-pre-wrap break-all">
                  {JSON.stringify(changes.after, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button type="button" variant="secondary" className="w-full xs:w-28" onClick={close}>
          Yopish
        </Button>
      </div>
    </div>
  );
};

export default RecordDetailModal;
