// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

// Data
import { platformOptions } from "@/features/social-networks/data/social-networks.data";

// API
import { socialNetworksAPI } from "@/features/social-networks/api/social-networks.api";

const SocialNetworkForm = ({
  close,
  isLoading,
  onSuccess,
  setIsLoading,
  isEdit = false,
  ...socialNetwork
}) => {
  const { name, chatId, username, platform, isActive, setField, setFields } =
    useObjectState({
      name: "",
      chatId: "",
      username: "",
      platform: "telegram",
      isActive: true,
    });

  useEffect(() => {
    if (isEdit && socialNetwork._id) {
      setFields({
        name: socialNetwork.name || "",
        chatId: socialNetwork.chatId || "",
        username: socialNetwork.username || "",
        platform: socialNetwork.platform || "telegram",
        isActive: socialNetwork.isActive ?? true,
      });
    }
  }, [isEdit, socialNetwork?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { name, chatId, username, platform, isActive };

      if (isEdit) {
        await socialNetworksAPI.update(socialNetwork._id, payload);
        toast.success("Ijtimoiy tarmoq yangilandi");
      } else {
        await socialNetworksAPI.create(payload);
        toast.success("Ijtimoiy tarmoq yaratildi");
      }

      onSuccess();
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        name="name"
        label="Nomi"
        value={name}
        placeholder="Platforma hisobi nomi"
        onChange={(e) => setField("name", e.target.value)}
      />

      <SelectField
        required
        value={platform}
        label="Platforma"
        options={platformOptions}
        triggerClassName="w-full"
        onChange={(v) => setField("platform", v)}
      />

      <InputGroup>
        <InputField
          required
          name="chatId"
          value={chatId}
          label="Chat ID"
          placeholder="-1001234567890"
          description="Kanal yoki guruhning raqamli ID si"
          onChange={(e) => setField("chatId", e.target.value)}
        />

        <InputField
          name="username"
          label="Username"
          value={username}
          placeholder="username_uz"
          description="@ belgisisiz"
          onChange={(e) => setField("username", e.target.value)}
        />
      </InputGroup>

      {/* Holat */}
      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
          className="size-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Aktiv
        </label>
      </div>

      {/* Amallar */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default SocialNetworkForm;
