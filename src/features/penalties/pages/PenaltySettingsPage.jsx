// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Icons
import { Settings, AlertTriangle } from "lucide-react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const PenaltySettingsPage = () => {
  const queryClient = useQueryClient();
  const { getCollectionData } = useArrayStore();
  const roles = getCollectionData("roles") || [];

  // Owner va developer'dan tashqari rollar
  const fineRoles = roles.filter(
    (r) => r.value !== "owner" && r.value !== "developer",
  );

  const { data: settings, isLoading } = useQuery({
    queryKey: ["penalties", "settings"],
    queryFn: () => penaltiesAPI.getSettings().then((res) => res.data.data),
  });

  // fineAmounts: { student: N, teacher: N, ... }
  const [fineAmounts, setFineAmounts] = useState({});

  useEffect(() => {
    if (settings && fineRoles.length > 0) {
      const amounts = {};
      for (const role of fineRoles) {
        // fineAmounts backend'dan object sifatida keladi (Map JSON'da object)
        amounts[role.value] = settings.fineAmounts?.[role.value] ?? 0;
      }
      setFineAmounts(amounts);
    }
  }, [settings, roles.length]);

  const saveMutation = useMutation({
    mutationFn: () =>
      penaltiesAPI.updateSettings({ fineAmounts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "settings"] });
      toast.success("Sozlamalar saqlandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Saqlashda xatolik"),
  });

  /**
   * Summani formatlash (1000 lik ajratish)
   * @param {number} amount - Summa
   * @returns {string} Formatlangan summa
   */
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Settings className="size-5 text-indigo-500" />
          Jarima sozlamalari
        </h2>

        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <p className="text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              Jarima miqdori o'zgarishi avvalgi jarimalar miqdoriga ta'sir qilmaydi. Yangi
              jarimalar uchun yangi miqdor qo'llaniladi.
            </p>
          </div>

          {fineRoles.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Rollar yuklanmoqda...
            </p>
          ) : (
            fineRoles.map((role) => (
              <div key={role.value}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {role.name} uchun jarima miqdori (so'm)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  12 ball yetganda to'lashi kerak bo'lgan jarima miqdori
                </p>
                <input
                  type="number"
                  min="0"
                  value={fineAmounts[role.value] ?? 0}
                  onChange={(e) =>
                    setFineAmounts((prev) => ({
                      ...prev,
                      [role.value]: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {(fineAmounts[role.value] ?? 0) > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {formatAmount(fineAmounts[role.value])} so'm
                  </p>
                )}
              </div>
            ))
          )}

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || fineRoles.length === 0}
            className="w-full px-4 text-sm font-medium"
          >
            {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PenaltySettingsPage;
