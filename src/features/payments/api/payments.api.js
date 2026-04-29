import http from "@/shared/api/http";

export const paymentsAPI = {
  getAll: (params) => http.get("/payments", { params }),
  search: (params) => http.get("/payments/search", { params }),
  create: (data) => http.post("/payments", data),
  update: (id, data) => http.put(`/payments/${id}`, data),
};
