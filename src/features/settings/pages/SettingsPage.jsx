// React
import { useState } from "react";

// TanStack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import { leadSourcesAPI }     from "../api/leadSources.api";
import { courseTypesAPI }     from "../api/courseTypes.api";
import { rejectionReasonsAPI } from "../api/rejectionReasons.api";

// Icons
import {
  Plus, Pencil, Trash2, Check, X, MapPin, BookOpen, AlertCircle,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// ─── Shared CRUD row ──────────────────────────────────────────────────────────

const EditRow = ({ value, onChange, onSave, onCancel, fields }) => (
  <div className="flex items-center gap-2 flex-wrap py-2">
    {fields.map((f) => (
      <input
        key={f.key}
        value={value[f.key] ?? ""}
        onChange={(e) => onChange(f.key, e.target.value)}
        placeholder={f.placeholder}
        className="flex-1 min-w-[120px] h-8 px-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brown-800"
      />
    ))}
    <button onClick={onSave} className="flex items-center justify-center w-8 h-8 bg-brown-800 text-white rounded hover:bg-brown-700">
      <Check size={13} />
    </button>
    <button onClick={onCancel} className="flex items-center justify-center w-8 h-8 border border-gray-200 text-gray-500 rounded hover:bg-gray-50">
      <X size={13} />
    </button>
  </div>
);

// ─── Lead Sources tab ─────────────────────────────────────────────────────────

const LeadSourcesTab = () => {
  const qc = useQueryClient();
  const [adding, setAdding]   = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState({ name: "", slug: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "lead-sources"],
    queryFn:  () => leadSourcesAPI.getAll({ limit: 100 }).then((r) => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["settings", "lead-sources"] });

  const createMut = useMutation({
    mutationFn: (d) => leadSourcesAPI.create(d),
    onSuccess: () => { toast.success("Manba qo'shildi"); invalidate(); setAdding(false); setForm({ name: "", slug: "" }); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => leadSourcesAPI.update(id, d),
    onSuccess: () => { toast.success("Yangilandi"); invalidate(); setEditId(null); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => leadSourcesAPI.delete(id),
    onSuccess: () => { toast.success("O'chirildi"); invalidate(); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const fields = [
    { key: "name", placeholder: "Manba nomi *" },
    { key: "slug", placeholder: "Slug (ixtiyoriy)" },
  ];

  const items = data?.leadSources ?? data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">{items.length} ta manba</p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setForm({ name: "", slug: "" }); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brown-800 text-white rounded hover:bg-brown-700"
          >
            <Plus size={12} /> Qo'shish
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <EditRow
            value={form}
            onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
            onSave={() => { if (!form.name.trim()) return toast.error("Nom kiritilishi shart"); createMut.mutate({ name: form.name.trim(), ...(form.slug && { slug: form.slug.trim() }) }); }}
            onCancel={() => setAdding(false)}
            fields={fields}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Manbalar yo'q</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item._id}>
              {editId === item._id ? (
                <EditRow
                  value={form}
                  onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
                  onSave={() => { if (!form.name.trim()) return toast.error("Nom kiritilishi shart"); updateMut.mutate({ id: item._id, d: { name: form.name.trim(), ...(form.slug !== undefined && { slug: form.slug.trim() }) } }); }}
                  onCancel={() => setEditId(null)}
                  fields={fields}
                />
              ) : (
                <div className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    {item.slug && <p className="text-xs text-gray-400 font-mono">{item.slug}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditId(item._id); setForm({ name: item.name, slug: item.slug ?? "" }); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`"${item.name}" ni o'chirasizmi?`)) deleteMut.mutate(item._id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Course Types tab ─────────────────────────────────────────────────────────

const CourseTypesTab = () => {
  const qc = useQueryClient();
  const [adding, setAdding]   = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState({ name: "", type: "", direction: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "course-types"],
    queryFn:  () => courseTypesAPI.getAll({ limit: 100 }).then((r) => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["settings", "course-types"] });

  const createMut = useMutation({
    mutationFn: (d) => courseTypesAPI.create(d),
    onSuccess: () => { toast.success("Kurs turi qo'shildi"); invalidate(); setAdding(false); setForm({ name: "", type: "", direction: "" }); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => courseTypesAPI.update(id, d),
    onSuccess: () => { toast.success("Yangilandi"); invalidate(); setEditId(null); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => courseTypesAPI.delete(id),
    onSuccess: () => { toast.success("O'chirildi"); invalidate(); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const fields = [
    { key: "name",      placeholder: "Kurs nomi *" },
    { key: "type",      placeholder: "Turi (masalan: offline)" },
    { key: "direction", placeholder: "Yo'nalish (masalan: IT)" },
  ];

  const items = data?.courseTypes ?? data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">{items.length} ta kurs turi</p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setForm({ name: "", type: "", direction: "" }); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brown-800 text-white rounded hover:bg-brown-700"
          >
            <Plus size={12} /> Qo'shish
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <EditRow
            value={form}
            onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
            onSave={() => { if (!form.name.trim()) return toast.error("Nom kiritilishi shart"); createMut.mutate({ name: form.name.trim(), type: form.type.trim(), direction: form.direction.trim() }); }}
            onCancel={() => setAdding(false)}
            fields={fields}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Kurs turlari yo'q</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item._id}>
              {editId === item._id ? (
                <EditRow
                  value={form}
                  onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
                  onSave={() => { if (!form.name.trim()) return toast.error("Nom kiritilishi shart"); updateMut.mutate({ id: item._id, d: { name: form.name.trim(), type: form.type.trim(), direction: form.direction.trim() } }); }}
                  onCancel={() => setEditId(null)}
                  fields={fields}
                />
              ) : (
                <div className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.type && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.type}</span>
                      )}
                      {item.direction && (
                        <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{item.direction}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditId(item._id); setForm({ name: item.name, type: item.type ?? "", direction: item.direction ?? "" }); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`"${item.name}" ni o'chirasizmi?`)) deleteMut.mutate(item._id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Rejection Reasons tab ────────────────────────────────────────────────────

const RejectionReasonsTab = () => {
  const qc = useQueryClient();
  const [adding, setAdding]   = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState({ title: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "rejection-reasons"],
    queryFn:  () => rejectionReasonsAPI.getAll({ limit: 100 }).then((r) => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["settings", "rejection-reasons"] });

  const createMut = useMutation({
    mutationFn: (d) => rejectionReasonsAPI.create(d),
    onSuccess: () => { toast.success("Sabab qo'shildi"); invalidate(); setAdding(false); setForm({ title: "", description: "" }); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => rejectionReasonsAPI.update(id, d),
    onSuccess: () => { toast.success("Yangilandi"); invalidate(); setEditId(null); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => rejectionReasonsAPI.delete(id),
    onSuccess: () => { toast.success("O'chirildi"); invalidate(); },
    onError:   (e) => toast.error(e.response?.data?.message || "Xatolik"),
  });

  const fields = [
    { key: "title",       placeholder: "Sarlavha *" },
    { key: "description", placeholder: "Tavsif (ixtiyoriy)" },
  ];

  const items = data?.rejectionReasons ?? data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">{items.length} ta sabab</p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setForm({ title: "", description: "" }); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brown-800 text-white rounded hover:bg-brown-700"
          >
            <Plus size={12} /> Qo'shish
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <EditRow
            value={form}
            onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
            onSave={() => { if (!form.title.trim()) return toast.error("Sarlavha kiritilishi shart"); createMut.mutate({ title: form.title.trim(), ...(form.description && { description: form.description.trim() }) }); }}
            onCancel={() => setAdding(false)}
            fields={fields}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Rad etish sabablari yo'q</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item._id}>
              {editId === item._id ? (
                <EditRow
                  value={form}
                  onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
                  onSave={() => { if (!form.title.trim()) return toast.error("Sarlavha kiritilishi shart"); updateMut.mutate({ id: item._id, d: { title: form.title.trim(), description: form.description.trim() } }); }}
                  onCancel={() => setEditId(null)}
                  fields={fields}
                />
              ) : (
                <div className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditId(item._id); setForm({ title: item.title, description: item.description ?? "" }); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`"${item.title}" ni o'chirasizmi?`)) deleteMut.mutate(item._id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "sources", label: "Lead manbalar",      icon: MapPin,      component: LeadSourcesTab },
  { key: "types",   label: "Kurs turlari",        icon: BookOpen,    component: CourseTypesTab },
  { key: "reasons", label: "Rad etish sabablari", icon: AlertCircle, component: RejectionReasonsTab },
];

const SettingsPage = () => {
  const [tab, setTab] = useState("sources");
  const ActiveTab = TABS.find((t) => t.key === tab)?.component ?? LeadSourcesTab;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-sm text-gray-400 mt-0.5">Lead manbalar, kurs turlari va rad etish sabablari</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Tab list */}
        <Card className="lg:col-span-1 !p-2 h-fit">
          <nav className="flex flex-col gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded transition-colors w-full text-left ${
                  tab === t.key
                    ? "bg-brown-50 text-brown-800 border-l-2 border-brown-800 pl-[10px]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent"
                }`}
              >
                <t.icon size={14} strokeWidth={tab === t.key ? 2 : 1.5} />
                {t.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Tab content */}
        <Card className="lg:col-span-3">
          <ActiveTab />
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
