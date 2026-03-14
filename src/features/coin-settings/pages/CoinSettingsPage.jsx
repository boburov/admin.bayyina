// Toast
import { toast } from "sonner";

// API
import { coinsAPI } from "@/shared/api/coins.api";

// React
import { useState, useEffect, useCallback } from "react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Icons
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

const CoinSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    dailyCoinPercentage: 60,
    schoolRankBonus: 100,
    classRankBonus: 20,
    minDailyGradeForCoin: 10,
  });

  const fetchAll = useCallback(async () => {
    setIsLoading(true);

    try {
      const settingsRes = await coinsAPI.getSettings();
      const s = settingsRes.data.data;
      setForm({
        dailyCoinPercentage: s.dailyCoinPercentage,
        schoolRankBonus: s.schoolRankBonus,
        classRankBonus: s.classRankBonus,
        minDailyGradeForCoin: s.minDailyGradeForCoin ?? 10,
      });
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await coinsAPI.updateSettings(form);
      toast.success("Sozlamalar saqlandi");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title mb-4">Tanga Sozlamalari</h1>

      {/* Form */}
      <Card>
        <InputGroup className="md:grid-cols-2">
          <InputField
            min="0"
            required
            type="number"
            placeholder="10, 20, ..."
            value={form.minDailyGradeForCoin}
            label="Tanga olish uchun minimal ball"
            description="O'quvchi kunlik shu balldan kam to'plasa coin berilmaydi"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minDailyGradeForCoin: Number(e.target.value),
              }))
            }
          />

          <InputField
            min="0"
            required
            max="100"
            type="number"
            value={form.dailyCoinPercentage}
            label="Kunlik coin foizi (%)"
            description="Har kuni o'quvchining umumiy ball × foiz = coin (pastga yaxlitlanadi)"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                dailyCoinPercentage: Number(e.target.value),
              }))
            }
          />

          <InputField
            min="0"
            required
            type="number"
            value={form.schoolRankBonus}
            label="Maktab 1-o'rin bonusi"
            description="Har yakshanba maktab reytingida birinchi o'quvchiga beriladigan bonus"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                schoolRankBonus: Number(e.target.value),
              }))
            }
          />

          <InputField
            min="0"
            required
            type="number"
            value={form.classRankBonus}
            label="Sinf 1-o'rin bonusi"
            description="Har yakshanba har bir sinfda birinchi o'quvchiga beriladigan bonus (bir student bir necha sinfda #1 bo'lsa faqat bir marta oladi)"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                classRankBonus: Number(e.target.value),
              }))
            }
          />

          {/* Submit button */}
          <Button disabled={isSaving} onClick={handleSave}>
            Saqlash{isSaving && "..."}
          </Button>
        </InputGroup>
      </Card>
    </div>
  );
};

export default CoinSettings;
