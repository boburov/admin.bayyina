// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// API
import { holidaysAPI } from "@/features/holidays/api/holidays.api";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Utils
import { formatHolidayDate } from "@/shared/utils/date.utils";

// Icons
import { Plus, Trash2, Edit, CalendarDays } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import HolidayForm from "../components/HolidayForm";
import Button from "@/shared/components/ui/button/Button";
import DeleteHolidayForm from "../components/DeleteHolidayForm";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { getHolidayTypeLabel } from "@/shared/data/holidayTypes.data";

const Holidays = () => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();

  const { openModal } = useModal();
  const holidays = getCollectionData("holidays");
  const isLoading = isCollectionLoading("holidays");

  useEffect(() => {
    if (!hasCollection("holidays")) {
      initialize(false, "holidays"); // pagination = false
    }

    if (!holidays?.length) fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setCollectionLoadingState(true, "holidays");
      const response = await holidaysAPI.getAll();
      setCollection(response.data.data, null, "holidays");
    } catch (error) {
      toast.error("Dam olish kunlarini yuklashda xatolik");
      setCollection([], true, "holidays");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        {/* Title */}
        <h1 className="page-title">Dam olish kunlari</h1>

        <Button onClick={() => openModal("createHoliday", null)}>
          <Plus strokeWidth={1.5} />
          Qo'shish
        </Button>
      </div>

      {/* List */}
      {holidays.length === 0 ? (
        <Card className="text-center py-8">
          <CalendarDays
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Dam olish kunlari mavjud emas</p>
        </Card>
      ) : (
        <div>
          <div className="rounded-lg overflow-x-auto border border-border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nomi</th>
                  <th>Turi</th>
                  <th>Sana</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>

              {/* Tbody */}
              <tbody>
                {holidays.map((holiday, index) => (
                  <tr key={holiday._id} className="hover:bg-gray-50">
                    <td className="text-center text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="text-center text-sm font-medium">
                      {holiday.name}
                    </td>

                    <td className="text-center text-sm text-gray-500">
                      {getHolidayTypeLabel(holiday.type)}
                    </td>

                    <td className="text-center text-sm text-gray-500">
                      {formatHolidayDate(holiday)}
                    </td>

                    <td className="text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          holiday.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {holiday.isActive ? "Aktiv" : "Noaktiv"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openModal("editHoliday", holiday)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => openModal("deleteHoliday", holiday)}
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
        </div>
      )}

      {/* Create Modal */}
      <ResponsiveModal name="createHoliday" title="Yangi dam olish kuni">
        <HolidayForm onSuccess={fetchHolidays} />
      </ResponsiveModal>

      {/* Edit Modal */}
      <ResponsiveModal name="editHoliday" title="Dam olish kunini tahrirlash">
        <HolidayForm isEdit onSuccess={fetchHolidays} />
      </ResponsiveModal>

      {/* Delete Modal */}
      <ResponsiveModal
        name="deleteHoliday"
        title="Dam olish kunini o'chirish"
        description="Haqiqatdan ham dam olish kunini o'chirmoqchimisiz?"
      >
        <DeleteHolidayForm onSuccess={fetchHolidays} />
      </ResponsiveModal>
    </div>
  );
};

export default Holidays;
