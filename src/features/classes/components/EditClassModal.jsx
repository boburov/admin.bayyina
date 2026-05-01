import { toast } from "sonner";
import { classesAPI } from "@/features/classes/api/classes.api";
import { useQueryClient } from "@tanstack/react-query";
import useObjectState from "@/shared/hooks/useObjectState";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import { salaryTypeOptions } from "@/features/classes/data/classes.data";

const EditClassModal = () => (
  <ResponsiveModal name="editClass" title="Guruhni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...classData }) => {
  const queryClient = useQueryClient();

  const { name, price, salaryType, salaryValue, minSalary, showPaymentsToTeacher, setField } =
    useObjectState({
      name:                 classData.name        ?? "",
      price:                classData.price        ?? "",
      salaryType:           classData.salaryType   ?? "percentage",
      salaryValue:          classData.salaryValue  ?? "",
      minSalary:            classData.minSalary    ?? "",
      showPaymentsToTeacher: classData.showPaymentsToTeacher ?? false,
    });

  const handleEdit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      ...(price !== "" && { price: Number(price) }),
      salaryType,
      ...(salaryValue !== "" && { salaryValue: Number(salaryValue) }),
      ...(minSalary !== "" && { minSalary: Number(minSalary) }),
      showPaymentsToTeacher,
    };

    classesAPI
      .update(classData._id, payload)
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
        queryClient.invalidateQueries({ queryKey: ["group-detail", classData._id] });
        toast.success("Guruh yangilandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  const isPercentageOrPerStudent = salaryType === "percentage" || salaryType === "per_student";

  return (
    <form onSubmit={handleEdit} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        maxLength={32}
        label="Guruh nomi"
        placeholder="Matematika 1, Ingliz tili B2, ..."
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        type="number"
        name="price"
        value={price}
        label="Oylik to'lov (so'm)"
        placeholder="500000"
        onChange={(e) => setField("price", e.target.value)}
      />

      {/* Salary settings */}
      <div className="pt-2 border-t border-border-secondary">
        <p className="text-xs font-semibold text-secondary-text uppercase tracking-wider mb-3">
          O'qituvchi maosh sozlamalari
        </p>

        <div className="flex flex-col gap-1.5 mb-3">
          <label className="text-sm font-medium">Maosh turi</label>
          <select
            value={salaryType}
            onChange={(e) => setField("salaryType", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border-secondary rounded-lg bg-background-secondary outline-none focus:border-border-primary transition-colors text-primary"
          >
            {salaryTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <InputField
          type="number"
          name="salaryValue"
          value={salaryValue}
          label={
            salaryType === "percentage"
              ? "Foiz (%)"
              : salaryType === "per_student"
              ? "Har bir o'quvchi uchun (so'm)"
              : "Belgilangan oylik (so'm)"
          }
          placeholder={salaryType === "percentage" ? "20" : "500000"}
          onChange={(e) => setField("salaryValue", e.target.value)}
        />

        {isPercentageOrPerStudent && (
          <div className="mt-3">
            <InputField
              type="number"
              name="minSalary"
              value={minSalary}
              label="Minimal kafolatlangan oylik (so'm)"
              placeholder="0 (yo'q)"
              onChange={(e) => setField("minSalary", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Payment visibility toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-border-secondary">
        <div>
          <p className="text-sm font-medium text-primary">To'lovlarni o'qituvchiga ko'rsatish</p>
          <p className="text-xs text-secondary-text mt-0.5">
            O'qituvchi o'quvchilar to'lov summasini ko'ra oladi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setField("showPaymentsToTeacher", !showPaymentsToTeacher)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showPaymentsToTeacher ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              showPaymentsToTeacher ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={() => close()}
        >
          Bekor qilish
        </Button>
        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yangilash{isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditClassModal;
