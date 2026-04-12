import http from "@/shared/api/http";

export const paymentsAPI = {
  getAll: (params) => http.get("/payments", { params }),
  create: (data) => http.post("/payments", data),
};
