import http from "@/shared/api/http";

export const usersAPI = {
  getAll: (params) => http.get("/users", { params }),
  getAllShort: () => http.get("/users/all-short"),
  getStats: () => http.get("/users/stats"),
  getStudents: (params) => http.get("/users/students", { params }),
  searchStudents: (params) => http.get("/users/students/search", { params }),
  create: (data) => http.post("/users", data),
  getTeachers: (params) => http.get("/users/teachers", { params }),
  searchTeachers: (params) => http.get("/users/teachers/search", { params }),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.delete(`/users/${id}`),
  resetPassword: (id, password) => http.put(`/users/${id}`, { password }),
  getPassword: (id) => http.get(`/users/${id}`),
  exportUsers: (role) =>
    http.get("/users/export", { params: { role }, responseType: "blob" }),
};
