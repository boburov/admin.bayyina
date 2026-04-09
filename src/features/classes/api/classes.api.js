import http from "@/shared/api/http";

export const classesAPI = {
  getAll: () => http.get("/groups"),
  getOne: (id) => http.get(`/groups/${id}`),
  create: (data) => http.post("/groups", data),
  update: (id, data) => http.put(`/groups/${id}`, data),
  delete: (id) => http.delete(`/groups/${id}`),
  exportStudents: (id) =>
    http.get(`/groups/${id}/export`, { responseType: "blob" }),
  exportAll: () => http.get("/groups/export", { responseType: "blob" }),
};
