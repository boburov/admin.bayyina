// Toaster
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// API
import { marketAPI } from "@/features/market/api/market.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formatUploadSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const MarketProductCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [upload, setUpload] = useState({ percent: 0, loaded: 0, total: 0 });
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    images: [],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("price", String(form.price));
      formData.append("quantity", String(form.quantity));
      formData.append("description", form.description.trim());
      Array.from(form.images || []).forEach((file) =>
        formData.append("images", file),
      );

      return marketAPI.createProduct(formData, {
        onUploadProgress: (event) => {
          const total = event.total || 0;
          const loaded = event.loaded || 0;
          const percent = total > 0 ? Math.round((loaded * 100) / total) : 0;
          setUpload({ percent, loaded, total });
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["market", "admin", "products"],
      });
      toast.success("Mahsulot yaratildi");
      navigate("/market/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const onSubmit = (event) => {
    event.preventDefault();

    if (!form.images || form.images.length < 1 || form.images.length > 3) {
      toast.error("Rasmlar soni 1 tadan 3 tagacha bo'lishi kerak");
      return;
    }

    createMutation.mutate();
  };

  return (
    <div>
      <h1 className="page-title mb-4">Mahsulot qo'shish</h1>

      <Card className="max-w-3xl">
        <InputGroup onSubmit={onSubmit} as="form">
          <InputField
            required
            label="Nomi"
            value={form.name}
            name="product-name"
            placeholder="Mahsulot nomi"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <InputGroup className="md:grid-cols-2">
            <InputField
              min={1}
              required
              name="price"
              type="number"
              label="Narxi"
              value={form.price}
              placeholder="Masalan: 120"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, price: e.target.value }))
              }
            />

            <InputField
              min={0}
              required
              label="Soni"
              type="number"
              name="quantity"
              value={form.quantity}
              placeholder="Masalan: 10"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />
          </InputGroup>

          <InputField
            label="Tavsif"
            type="textarea"
            name="description"
            value={form.description}
            placeholder="Qo'shimcha ma'lumot"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          <InputField
            multiple
            required
            type="file"
            name="images"
            label="Rasmlar"
            accept="image/*"
            placeholder="Qo'shimcha ma'lumot"
            description="1 tadan 3 tagacha rasm yuklang"
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                images: e.target.files,
              }));
            }}
          />

          {createMutation.isPending && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
              <p className="font-medium">Yuklanmoqda: {upload.percent}%</p>
              <p>
                {formatUploadSize(upload.loaded)} /{" "}
                {formatUploadSize(upload.total || upload.loaded)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/market/products")}
            >
              Bekor qilish
            </Button>

            <Button disabled={createMutation.isPending}>Saqlash</Button>
          </div>
        </InputGroup>
      </Card>
    </div>
  );
};

export default MarketProductCreatePage;
