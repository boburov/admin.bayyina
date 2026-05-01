import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Users, GraduationCap, BookOpen, CheckCircle2 } from "lucide-react";
import { telegramAPI } from "../api/telegram.api";
import Card from "@/shared/components/ui/Card";

const TARGET_OPTIONS = [
  { value: "all",      label: "Barcha (student + teacher)",  icon: Users },
  { value: "students", label: "Faqat o'quvchilar",           icon: BookOpen },
  { value: "teachers", label: "Faqat o'qituvchilar",         icon: GraduationCap },
];

const TelegramPage = () => {
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
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Telegram xabar</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Bot orqali foydalanuvchilarga xabar yuborish
        </p>
      </div>

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
            <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              <span>
                <b>{lastResult.sent}</b> ta xabar muvaffaqiyatli yuborildi
                {lastResult.failed > 0 && (
                  <span className="text-red-600 ml-1">({lastResult.failed} ta xato)</span>
                )}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TelegramPage;
