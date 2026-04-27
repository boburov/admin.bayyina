import http from "@/shared/api/http";

export const rejectionReasonsAPI = {
  getAll:  (params) => http.get("/rejection-reasons", { params }),
  create:  (data)   => http.post("/rejection-reasons", data),
  update:  (id, data) => http.put(`/rejection-reasons/${id}`, data),
  delete:  (id)     => http.delete(`/rejection-reasons/${id}`),
};
