// Toast
import { toast } from "sonner";

// Icons
import { Plus, Edit, Trash2, List } from "lucide-react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Data
import { targetRoleOptions } from "../data/penalties.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Modals
import CreateCategoryModal from "../components/CreateCategoryModal";
import EditCategoryModal from "../components/EditCategoryModal";

const PenaltyCategoriesPage = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["penalties", "categories"],
    queryFn: () => penaltiesAPI.getCategories().then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => penaltiesAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "categories"] });
      toast.success("Kategoriya o'chirildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleDelete = (id) => {
    if (!confirm("Kategoriyani o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {/* Title */}
        <h1 className="page-title">Jarima kategoriyalari</h1>

        {/* Button */}
        <Button onClick={() => openModal("createPenaltyCategory")}>
          <Plus />
          Yangi kategoriya
        </Button>
      </div>

      {/* Categories list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-gray-500">Kategoriyalar topilmadi</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat._id} className="relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {cat.title}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">
                      {cat.points} ball
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                      {targetRoleOptions.find((o) => o.value === cat.targetRole)
                        ?.label ?? cat.targetRole}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openModal("editPenaltyCategory", cat)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateCategoryModal />
      <EditCategoryModal />
    </div>
  );
};

export default PenaltyCategoriesPage;
