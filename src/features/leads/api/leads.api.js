import http from "@/shared/api/http";

export const leadsAPI = {
  getAll: (params) => http.get("/leads", { params }),
  getOne: (id)     => http.get(`/leads/${id}`),
  update: (id, data) => http.put(`/leads/${id}`, data),
  delete: (id)     => http.delete(`/leads/${id}`),
};
