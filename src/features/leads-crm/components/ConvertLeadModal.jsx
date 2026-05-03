import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GraduationCap, Search, School } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { leadsAPI }   from "@/features/leads/api/leads.api";
import { usersAPI }   from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";


const ConvertLeadModal = ({ open, lead, onClose, onSuccess }) => {
  const qc = useQueryClient();
  const [groupSearch,    setGroupSearch]     = useState("");
  const [selectedGroups, setSelectedGroups]  = useState([]);

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["classes"],
    queryFn:  () => classesAPI.getAll({ limit: 200 }).then((r) => r.data),
    enabled:  open,
  });

  const allGroups     = groupsData?.groups ?? [];
  const filteredGroups = allGroups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const toggleGroup = (group) => {
    setSelectedGroups((prev) =>
      prev.some((g) => g._id === group._id)
        ? prev.filter((g) => g._id !== group._id)
        : [...prev, group]
    );
  };

  const convertMut = useMutation({
    mutationFn: async () => {
      // 1. Mark lead converted
      await leadsAPI.update(lead._id, { status: "converted" });

      // 2. Create student
      const phone    = String(lead.phone ?? "").replace(/\D/g, "");
      const phoneNum = phone ? Number(phone) : undefined;

      await usersAPI.create({
        firstName: lead.firstName ?? "",
        lastName:  lead.lastName  ?? "",
        phone:     phoneNum,
        password:  phone.length >= 6 ? phone : "12345678",
        role:      "student",
        groupIds:  selectedGroups.map((g) => g._id),
      });
    },
    onSuccess: () => {
      toast.success(`${lead.firstName} o'quvchi sifatida qabul qilindi`);
      reset();
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message ?? e.message ?? "Xatolik yuz berdi"),
  });

  const reset = () => {
    setGroupSearch("");
    setSelectedGroups([]);
  };

  const handleClose = () => {
    if (convertMut.isPending) return;
    reset();
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[90vw] max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-green-50 border border-green-200">
              <GraduationCap size={14} className="text-green-700" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900">
              O'quvchi sifatida qabul qilish
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">

          {/* Lead info */}
          <div className="p-3 bg-gray-50 rounded border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-brown-50 border border-brown-200 flex items-center justify-center text-sm font-semibold text-brown-800 shrink-0">
              {lead.firstName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{lead.firstName} {lead.lastName}</p>
              <p className="text-xs text-gray-400 font-mono">{lead.phone ? `+${lead.phone}` : "—"}</p>
            </div>
          </div>

          {/* Multi-group picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600">
                Guruhlar{" "}
                <span className="text-gray-400 font-normal">(ixtiyoriy, bir yoki bir nechta)</span>
              </label>
              {selectedGroups.length > 0 && (
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  {selectedGroups.length} ta
                </span>
              )}
            </div>

            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                <Search className="size-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                <input
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Guruh qidirish..."
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                {groupsLoading ? (
                  <div className="flex justify-center py-5">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="flex flex-col items-center gap-1.5 py-5 text-gray-400">
                    <School className="size-6 opacity-40" strokeWidth={1.5} />
                    <p className="text-xs">Guruh topilmadi</p>
                  </div>
                ) : (
                  filteredGroups.map((group) => {
                    const isSelected = selectedGroups.some((g) => g._id === group._id);
                    return (
                      <button
                        key={group._id}
                        type="button"
                        onClick={() => toggleGroup(group)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          isSelected ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-green-500 border-green-500" : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                          {group.teacher && (
                            <p className="text-xs text-gray-500 truncate">
                              {group.teacher.firstName} {group.teacher.lastName}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={convertMut.isPending}
            className="text-sm px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={convertMut.isPending}
            onClick={() => convertMut.mutate()}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <GraduationCap size={14} />
            {convertMut.isPending ? "Amalga oshirilmoqda..." : "Qabul qilish"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadModal;
