// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Utils
import { months } from "@/shared/utils/date.utils";

// API
import { holidaysAPI } from "@/shared/api/holidays.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import { holidayTypes } from "@/shared/data/holidayTypes.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

const HolidayForm = ({
  close,
  isLoading,
  onSuccess,
  setIsLoading,
  isEdit = false,
  ...holiday
}) => {
  const {
    name,
    type,
    date,
    endDate,
    isActive,
    setField,
    setFields,
    startDate,
    description,
    recurringDay,
    recurringType,
    recurringMonth,
    recurringEndDay,
    recurringStartDay,
    recurringEndMonth,
    recurringStartMonth,
  } = useObjectState({
    name: "",
    date: "",
    endDate: "",
    startDate: "",
    type: "single",
    isActive: true,
    description: "",
    recurringDay: 1,
    recurringMonth: 0,
    recurringEndDay: 1,
    recurringStartDay: 1,
    recurringEndMonth: 0,
    recurringStartMonth: 0,
    recurringType: "single",
  });

  useEffect(() => {
    if (isEdit && holiday._id) {
      const hasRecurringRange =
        holiday.recurringStartDate?.month !== undefined &&
        holiday.recurringEndDate?.month !== undefined;

      setFields({
        name: holiday.name || "",
        type: holiday.type || "single",
        isActive: holiday.isActive ?? true,
        description: holiday.description || "",
        recurringDay: holiday.recurringDate?.day ?? 1,
        recurringMonth: holiday.recurringDate?.month ?? 0,
        recurringEndDay: holiday.recurringEndDate?.day ?? 1,
        date: holiday.date ? holiday.date.split("T")[0] : "",
        recurringType: hasRecurringRange ? "range" : "single",
        recurringEndMonth: holiday.recurringEndDate?.month ?? 0,
        recurringStartDay: holiday.recurringStartDate?.day ?? 1,
        recurringStartMonth: holiday.recurringStartDate?.month ?? 0,
        endDate: holiday.endDate ? holiday.endDate.split("T")[0] : "",
        startDate: holiday.startDate ? holiday.startDate.split("T")[0] : "",
      });
    }
  }, [isEdit, holiday?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { name, description, type, isActive };

      if (type === "single") {
        payload.date = date;
      } else if (type === "range") {
        payload.startDate = startDate;
        payload.endDate = endDate;
      } else if (type === "recurring") {
        if (recurringType === "single") {
          payload.recurringDate = {
            month: parseInt(recurringMonth),
            day: parseInt(recurringDay),
          };
        } else {
          payload.recurringStartDate = {
            month: parseInt(recurringStartMonth),
            day: parseInt(recurringStartDay),
          };
          payload.recurringEndDate = {
            month: parseInt(recurringEndMonth),
            day: parseInt(recurringEndDay),
          };
        }
      }

      let response;
      if (isEdit) {
        response = await holidaysAPI.update(holiday._id, payload);
        toast.success("Dam olish kuni yangilandi");
      } else {
        response = await holidaysAPI.create(payload);
        toast.success("Dam olish kuni yaratildi");
      }

      onSuccess(response.data.data);
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
        label="Nomi"
        value={name}
        placeholder="Masalan: Yangi yil bayrami"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        label="Tavsif"
        value={description}
        placeholder="Qo'shimcha ma'lumot"
        onChange={(e) => setField("description", e.target.value)}
      />

      <SelectField
        required
        label="Turi"
        value={type}
        options={holidayTypes}
        triggerClassName="w-full"
        onChange={(v) => setField("type", v)}
      />

      {/* Bir kunlik */}
      {type === "single" && (
        <InputField
          required
          type="date"
          label="Sana"
          value={date}
          onChange={(e) => setField("date", e.target.value)}
        />
      )}

      {/* Vaqt oralig'i */}
      {type === "range" && (
        <InputGroup className="grid-cols-2">
          <InputField
            required
            type="date"
            value={startDate}
            label="Boshlanish sanasi"
            onChange={(e) => setField("startDate", e.target.value)}
          />

          <InputField
            required
            type="date"
            value={endDate}
            label="Tugash sanasi"
            onChange={(e) => setField("endDate", e.target.value)}
          />
        </InputGroup>
      )}

      {/* Har yili takrorlanuvchi */}
      {type === "recurring" && (
        <div className="space-y-4">
          <SelectField
            required
            className="w-full"
            value={recurringType}
            label="Takrorlanish turi"
            onChange={(v) => setField("recurringType", v)}
            options={[
              { label: "Bir kun", value: "single" },
              { label: "Vaqt oralig'i", value: "range" },
            ]}
          />

          {/* Single */}
          {recurringType === "single" && (
            <InputGroup className="grid-cols-2">
              <SelectField
                required
                label="Oy"
                options={months}
                value={recurringMonth}
                onChange={(v) => setField("recurringMonth", parseInt(v))}
              />

              <InputField
                min={1}
                max={31}
                required
                label="Kun"
                type="number"
                value={recurringDay}
                onChange={(e) =>
                  setField("recurringDay", parseInt(e.target.value))
                }
              />
            </InputGroup>
          )}

          {/* Range */}
          {recurringType === "range" && (
            <>
              {/* Start date */}
              <p className="text-sm text-gray-600 font-medium">
                Boshlanish sanasi:
              </p>

              <InputGroup className="grid-cols-2">
                <SelectField
                  required
                  label="Oy"
                  options={months}
                  value={recurringStartMonth}
                  onChange={(v) => setField("recurringStartMonth", parseInt(v))}
                />

                <InputField
                  min={1}
                  max={31}
                  required
                  label="Kun"
                  type="number"
                  value={recurringStartDay}
                  onChange={(e) =>
                    setField("recurringStartDay", parseInt(e.target.value))
                  }
                />
              </InputGroup>

              {/* End date */}
              <p className="text-sm text-gray-600 font-medium">
                Tugash sanasi:
              </p>

              <InputGroup className="grid-cols-2">
                <SelectField
                  required
                  label="Oy"
                  options={months}
                  value={recurringEndMonth}
                  onChange={(v) => setField("recurringEndMonth", parseInt(v))}
                />

                <InputField
                  min={1}
                  max={31}
                  required
                  label="Kun"
                  type="number"
                  value={recurringEndDay}
                  onChange={(e) =>
                    setField("recurringEndDay", parseInt(e.target.value))
                  }
                />
              </InputGroup>
            </>
          )}
        </div>
      )}

      {/* Status */}
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

      {/* Action buttons */}
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

export default HolidayForm;
