// Toast
import { toast } from "sonner";

// React
import { useState, useEffect, useCallback } from "react";

// Icons
import { Copy } from "lucide-react";

// API
import { monitorsAPI } from "@/features/monitors/api/monitors.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";

const MonitorsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [hasMonitor, setHasMonitor] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await monitorsAPI.getSettings();
      const data = res.data.data;
      if (data) {
        setCode(data.code || "");
        setName(data.name || "");
        setHasMonitor(true);
      }
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (code.length !== 6) {
      return toast.error("Monitor kodi 6 xonali raqam bo'lishi kerak");
    }

    setIsSaving(true);
    try {
      await monitorsAPI.updateSettings({ code, name });
      toast.success("Monitor sozlamalari saqlandi");
      setHasMonitor(true);
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Kod nusxalandi");
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
      <h1 className="page-title mb-4">Monitor sozlamalari</h1>

      {/* Hozirgi kod */}
      {hasMonitor && (
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Hozirgi monitor kodi</p>
              <p className="text-3xl font-bold tracking-widest text-blue-600">
                {code}
              </p>
              {name && <p className="text-sm text-gray-500 mt-1">{name}</p>}
            </div>

            <Button variant="outline" onClick={handleCopyCode}>
              <Copy strokeWidth={1.5} className="size-4" />
              Nusxalash
            </Button>
          </div>
        </Card>
      )}

      {/* Forma */}
      <Card
        className="space-y-4"
        title={
          hasMonitor ? "Kodni o'zgartirish" : "Yangi monitor kodi yaratish"
        }
      >
        <InputGroup className="sm:grid-cols-2 mb-4">
          <InputField
            type="otp"
            value={code}
            maxLength={6}
            onChange={setCode}
            label="6 xonali kod"
          />

          <InputField
            value={name}
            placeholder="1-qavat koridori"
            label="Monitor nomi (Ixtiyoriy)"
            onChange={(e) => setName(e.target.value)}
          />
        </InputGroup>

        <Button disabled={isSaving || code.length !== 6} onClick={handleSave}>
          Saqlash{isSaving && "..."}
        </Button>
      </Card>
    </div>
  );
};

export default MonitorsPage;
