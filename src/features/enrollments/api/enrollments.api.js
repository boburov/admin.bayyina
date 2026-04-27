import http from "@/shared/api/http";

export const enrollmentsAPI = {
  getAll: (params) => http.get("/enrollments", { params }),
  getOne: (id)     => http.get(`/enrollments/${id}`),
  update: (id, data) => http.put(`/enrollments/${id}`, data),
};
