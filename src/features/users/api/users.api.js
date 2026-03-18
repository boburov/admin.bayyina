import http from "@/shared/api/http";

export const usersAPI = {
  getAll: (params) => http.get("/users", { params }),
  getStats: () => http.get("/users/stats"),
  create: (data) => http.post("/users", data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.delete(`/users/${id}`),
  resetPassword: (id, data) => http.put(`/users/${id}/reset-password`, data),
  getPassword: (id) => http.get(`/users/${id}/password`),
  exportUsers: (role) =>
    http.get("/users/export", { params: { role }, responseType: "blob" }),
};
