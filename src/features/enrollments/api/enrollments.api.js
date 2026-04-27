import http from "@/shared/api/http";

export const enrollmentsAPI = {
  getAll:  (params)     => http.get("/enrollments", { params }),
  getOne:  (id)         => http.get(`/enrollments/${id}`),
  create:  (data)       => http.post("/enrollments", data),
  update:  (id, data)   => http.put(`/enrollments/${id}`, data),
  delete:  (id)         => http.delete(`/enrollments/${id}`),
};
