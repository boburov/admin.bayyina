// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Icons
import { Plus, Edit, Trash2, Lock, Users } from "lucide-react";

const RolesPage = () => {
  const { openModal } = useModal();
  const { data: roles, isLoading } = useArrayStore("roles");

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="page-title">Rollar</h1>

        <Button onClick={() => openModal("createRole")} className="px-3.5">
          <Plus strokeWidth={1.5} />
          Yangi rol
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role._id}>
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-500">{role.value}</p>
              </div>

              {/* Action buttons */}
              {role.isSystem ? (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock className="size-3.5" strokeWidth={1.5} />
                  Tizim roli
                </span>
              ) : (
                <div className="flex gap-3.5">
                  <button
                    onClick={() => openModal("editRole", role)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="size-5" strokeWidth={1.5} />
                  </button>

                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => openModal("deleteRole", role)}
                  >
                    <Trash2 className="size-5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="flex items-center pt-4 border-t">
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="size-4" strokeWidth={1.5} />
                {role.usersCount} ta foydalanuvchi
              </span>
            </div>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Hozircha rollar yo'q</p>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
