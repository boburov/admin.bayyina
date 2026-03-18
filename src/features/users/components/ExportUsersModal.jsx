// UI
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// React
import { useState } from "react";

// Components
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Export type options
const exportOptions = [
  { value: "all", label: "Barcha foydalanuvchilar" },
  { value: "teacher", label: "Faqat o'qituvchilar" },
  { value: "student", label: "Faqat o'quvchilar" },
];

const ExportUsersModal = () => (
  <ResponsiveModal name="exportUsers" title="Foydalanuvchilarni yuklash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const [exportType, setExportType] = useState("all");

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const response = await usersAPI.exportUsers(exportType);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const today = new Date().toISOString().split("T")[0];
      let filename = "users";
      if (exportType === "teacher") filename = "teachers";
      else if (exportType === "student") filename = "students";
      link.download = `${filename}_${today}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fayl muvaffaqiyatli yuklandi");
      close();
    } catch (error) {
      toast.error(error.message || "Eksport qilishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Export Type Select */}
      <Select
        size="lg"
        required
        value={exportType}
        options={exportOptions}
        disabled={isLoading}
        onChange={setExportType}
        label="Yuklab olish turi"
        placeholder="Turni tanlang"
      />

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          onClick={handleExport}
          className="w-full xs:w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yuklash
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default ExportUsersModal;
