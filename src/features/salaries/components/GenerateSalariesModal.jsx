// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// API
import { salariesAPI } from "@/features/salaries/api/salaries.api";

// Data
import { salariesKeys, monthOptions } from "@/features/salaries/data/salaries.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/form/select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const GenerateSalariesModal = () => (
  <ResponsiveModal name="generateSalaries" title="Oyliklarni hisoblash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const qc = useQueryClient();
  const [month,     setMonth]     = useState(monthOptions[1]?.value ?? "");
  const [overwrite, setOverwrite] = useState(false);

  const handleGenerate = () => {
    if (!month) return toast.error("Oyni tanlang");
    setIsLoading(true);
    salariesAPI
      .generate({ month, overwrite })
      .then((res) => {
        const created = res.data?.created?.length ?? 0;
        const skipped = res.data?.skipped?.length ?? 0;
        toast.success(`${created} ta oylik yaratildi${skipped ? `, ${skipped} ta o'tkazib yuborildi` : ""}`);
        qc.invalidateQueries({ queryKey: salariesKeys.all });
        close();
      })
      .catch((err) => toast.error(err.response?.data?.message ?? "Xatolik"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Tanlangan oy uchun barcha o'qituvchilar bo'yicha oyliklar avtomatik hisoblanadi.
      </p>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Oy</label>
        <Select
          size="md"
          value={month}
          onChange={setMonth}
          options={monthOptions}
          placeholder="Oy tanlang"
        />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={overwrite}
          onChange={(e) => setOverwrite(e.target.checked)}
          className="w-4 h-4 accent-brown-800"
        />
        <span className="text-sm text-gray-700">
          Mavjudlarni qayta hisoblash (overwrite)
        </span>
      </label>

      <Button
        className="w-full"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? "Hisoblanmoqda..." : "Hisoblash"}
      </Button>
    </div>
  );
};

export default GenerateSalariesModal;
