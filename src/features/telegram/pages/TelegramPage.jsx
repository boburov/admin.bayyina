import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Users, GraduationCap, BookOpen, CheckCircle2, School } from "lucide-react";
import { telegramAPI } from "../api/telegram.api";
import { classesAPI }  from "@/features/classes/api/classes.api";
import Card from "@/shared/components/ui/Card";

const TARGET_OPTIONS = [
  { value: "all",      label: "Barcha (student + teacher)",  icon: Users },
  { value: "students", label: "Faqat o'quvchilar",           icon: BookOpen },
  { value: "teachers", label: "Faqat o'qituvchilar",         icon: GraduationCap },
];

// ─── Broadcast tab ────────────────────────────────────────────────────────────

const BroadcastTab = () => {
  const [target, setTarget]   = useState("all");
  const [message, setMessage] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const { data: statsData } = useQuery({
    queryKey: ["telegram", "stats"],
    queryFn: () => telegramAPI.getStats().then((r) => r.data),
  });

  const stats = statsData ?? { all: 0, students: 0, teachers: 0 };
  const recipientCount =
    target === "students" ? stats.students :
    target === "teachers" ? stats.teachers :
    stats.all;

  const sendMut = useMutation({
    mutationFn: (d) => telegramAPI.sendMessage(d),
    onSuccess: (res) => {
      const result = res.data;
      setLastResult(result);
      toast.success(`${result.sent} ta xabar yuborildi`);
      setMessage("");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSend = () => {
    if (!message.trim()) return toast.error("Xabar matni kiritilishi shart");
    setLastResult(null);
    sendMut.mutate({ message: message.trim(), target });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1 h-fit">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Kimga yuborish
        </p>
        <div className="flex flex-col gap-1.5">
          {TARGET_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const count =
              opt.value === "students" ? stats.students :
              opt.value === "teachers" ? stats.teachers :
              stats.all;
            return (
              <button
                key={opt.value}
                onClick={() => setTarget(opt.value)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded border transition-colors text-left w-full ${
                  target === opt.value
                    ? "border-brown-800 bg-brown-50 text-brown-800 font-medium"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                <span className="flex-1">{opt.label}</span>
                <span className="text-xs font-semibold tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Xabar matni
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="HTML format qo'llab-quvvatlanadi: <b>qalin</b>, <i>kursiv</i>"
          rows={6}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400"
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <p className="text-xs text-gray-400">
            {recipientCount} ta foydalanuvchiga yuboriladi
          </p>
          <button
            onClick={handleSend}
            disabled={sendMut.isPending || !message.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brown-800 text-white text-sm font-medium rounded hover:bg-brown-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
            {sendMut.isPending ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>

        {lastResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>
                <b>{lastResult.sent}</b> / <b>{lastResult.total}</b> ta odamga xabar yetkazildi
              </span>
            </div>
            {lastResult.failed > 0 && (
              <p className="text-red-600 pl-5">{lastResult.failed} ta xato (Telegram bog'langan lekin yetkazilmadi)</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Group message tab ────────────────────────────────────────────────────────

const GroupMessageTab = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["classes", { limit: 200 }],
    queryFn: () => classesAPI.getAll({ limit: 200 }).then((r) => r.data),
    staleTime: 60_000,
  });

  const groups = groupsData?.groups ?? [];

  const sendMut = useMutation({
    mutationFn: ({ id, message: msg }) => classesAPI.sendMessage(id, { message: msg }),
    onSuccess: (res) => {
      const result = res.data;
      setLastResult(result);
      toast.success(`${result.sent} ta xabar yuborildi`);
      setMessage("");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSend = () => {
    if (!selectedGroup) return toast.error("Guruh tanlang");
    if (!message.trim()) return toast.error("Xabar matni kiritilishi shart");
    setLastResult(null);
    sendMut.mutate({ id: selectedGroup._id, message: message.trim() });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Group list */}
      <Card className="lg:col-span-1 h-fit">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Guruh tanlash
        </p>
        {groupsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-gray-400">Guruhlar topilmadi</p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
            {groups.map((g) => (
              <button
                key={g._id}
                onClick={() => { setSelectedGroup(g); setLastResult(null); }}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded border transition-colors text-left w-full ${
                  selectedGroup?._id === g._id
                    ? "border-brown-800 bg-brown-50 text-brown-800 font-medium"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <School size={13} className="shrink-0" />
                <span className="flex-1 truncate">{g.name}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Message composer */}
      <Card className="lg:col-span-2">
        {selectedGroup ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brown-50 border border-brown-200 flex items-center justify-center text-xs font-semibold text-brown-800 shrink-0">
                {selectedGroup.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedGroup.name}</p>
                <p className="text-xs text-gray-400">
                  {selectedGroup.teacher?.firstName} {selectedGroup.teacher?.lastName}
                </p>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Xabar matni
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="HTML format: <b>qalin</b>, <i>kursiv</i>"
              rows={6}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-brown-800 placeholder:text-gray-400"
            />
            <div className="flex items-center justify-between mt-3 gap-3">
              <p className="text-xs text-gray-400">
                Guruhning faol o'quvchilariga yuboriladi
              </p>
              <button
                onClick={handleSend}
                disabled={sendMut.isPending || !message.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-brown-800 text-white text-sm font-medium rounded hover:bg-brown-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={14} />
                {sendMut.isPending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>

            {lastResult && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>
                    <b>{lastResult.sent}</b> / <b>{lastResult.total}</b> ta o'quvchiga xabar yetkazildi
                  </span>
                </div>
                {lastResult.failed > 0 && (
                  <p className="text-red-600 pl-5">{lastResult.failed} ta xato (Telegram bog'langan lekin yetkazilmadi)</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <School size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Chap tarafdan guruh tanlang</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "broadcast", label: "Ommaviy xabar" },
  { key: "group",     label: "Guruhga xabar" },
];

const TelegramPage = () => {
  const [tab, setTab] = useState("broadcast");

  const { data: statsData } = useQuery({
    queryKey: ["telegram", "stats"],
    queryFn: () => telegramAPI.getStats().then((r) => r.data),
  });
  const stats = statsData ?? { all: 0, students: 0, teachers: 0 };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Telegram xabar</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Bot orqali foydalanuvchilarga xabar yuborish
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {[
          { label: "Jami bog'langan", value: stats.all,      color: "bg-blue-50 text-blue-700" },
          { label: "O'quvchilar",     value: stats.students, color: "bg-green-50 text-green-700" },
          { label: "O'qituvchilar",   value: stats.teachers, color: "bg-amber-50 text-amber-700" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 !py-3">
            <div className={`text-2xl font-bold px-3 py-1 rounded ${s.color}`}>
              {s.value}
            </div>
            <p className="text-sm text-gray-600">{s.label} Telegram ID</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-gray-200 rounded w-fit mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "broadcast" ? <BroadcastTab /> : <GroupMessageTab />}
    </div>
  );
};

export default TelegramPage;
