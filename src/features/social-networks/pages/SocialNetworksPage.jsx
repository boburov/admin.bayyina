// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Icons
import { Plus, Trash2, Edit, Share2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SocialNetworkForm from "../components/SocialNetworkForm";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import DeleteSocialNetworkForm from "../components/DeleteSocialNetworkForm";

// Data
import { platformLabels } from "@/features/social-networks/data/social-networks.data";

// API
import { socialNetworksAPI } from "@/features/social-networks/api/social-networks.api";

const SocialNetworksPage = () => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();

  const { openModal } = useModal();
  const socialNetworks = getCollectionData("socialNetworks");
  const isLoading = isCollectionLoading("socialNetworks");

  useEffect(() => {
    if (!hasCollection("socialNetworks")) {
      initialize(false, "socialNetworks");
    }

    if (!socialNetworks?.length) fetchSocialNetworks();
  }, []);

  const fetchSocialNetworks = async () => {
    try {
      setCollectionLoadingState(true, "socialNetworks");
      const response = await socialNetworksAPI.getAll();
      setCollection(response.data.data, null, "socialNetworks");
    } catch (error) {
      toast.error("Ijtimoiy tarmoqlarni yuklashda xatolik");
      setCollection([], true, "socialNetworks");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title">Ijtimoiy tarmoqlar</h1>

        <Button onClick={() => openModal("createSocialNetwork", null)}>
          <Plus strokeWidth={1.5} />
          Qo'shish
        </Button>
      </div>

      {/* List */}
      {socialNetworks.length === 0 ? (
        <Card className="text-center py-8">
          <Share2
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Ijtimoiy tarmoqlar mavjud emas</p>
        </Card>
      ) : (
        <div className="rounded-lg overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Nomi</th>
                <th>Platforma</th>
                <th>Username</th>
                <th>Chat ID</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>

            <tbody>
              {socialNetworks.map((item, index) => (
                <tr key={item._id}>
                  <td className="text-center text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="text-center text-sm font-medium">
                    {item.name}
                  </td>

                  <td className="text-center text-sm text-gray-500">
                    {platformLabels[item.platform] || item.platform}
                  </td>

                  <td className="text-center text-sm text-gray-500">
                    {item.username ? `@${item.username}` : "-"}
                  </td>

                  <td className="text-center text-sm text-gray-500 font-mono">
                    {item.chatId}
                  </td>

                  <td className="text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.isActive ? "Aktiv" : "Noaktiv"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openModal("editSocialNetwork", item)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => openModal("deleteSocialNetwork", item)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <ResponsiveModal name="createSocialNetwork" title="Yangi ijtimoiy tarmoq">
        <SocialNetworkForm onSuccess={fetchSocialNetworks} />
      </ResponsiveModal>

      {/* Edit Modal */}
      <ResponsiveModal
        name="editSocialNetwork"
        title="Ijtimoiy tarmoqni tahrirlash"
      >
        <SocialNetworkForm isEdit onSuccess={fetchSocialNetworks} />
      </ResponsiveModal>

      {/* Delete Modal */}
      <ResponsiveModal
        name="deleteSocialNetwork"
        title="Ijtimoiy tarmoqni o'chirish"
        description="Haqiqatdan ham ijtimoiy tarmoqni o'chirmoqchimisiz?"
      >
        <DeleteSocialNetworkForm onSuccess={fetchSocialNetworks} />
      </ResponsiveModal>
    </div>
  );
};

export default SocialNetworksPage;
