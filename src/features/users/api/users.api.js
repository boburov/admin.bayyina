import http from "@/shared/api/http";

export const usersAPI = {
  getAll: (params) => http.get("/user", { params }),
  getAllShort: () => http.get("/users/all-short"),
  getStats: () => http.get("/users/stats"),
  getStudents: (params) => http.get("/users/students", { params }),
  create: (data) => http.post("/user", data),
  getTeachers: (params) => http.get("/users/teachers", { params }),
  update: (id, data) => http.put(`/user/${id}`, data),
  delete: (id) => http.delete(`/user/${id}`),
  resetPassword: (id, data) => http.put(`/user/${id}/reset-password`, data),
  getPassword: (id) => http.get(`/user/${id}/password`),
  exportUsers: (role) =>
    http.get("/users/export", { params: { role }, responseType: "blob" }),
};
