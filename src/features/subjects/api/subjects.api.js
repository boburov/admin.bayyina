import http from "@/shared/api/http";

export const subjectsAPI = {
  getAll: () => http.get("/subjects"),
  create: (data) => http.post("/subjects", data),
  update: (id, data) => http.put(`/subjects/${id}`, data),
  delete: (id) => http.delete(`/subjects/${id}`),
  export: () => http.get("/subjects/export", { responseType: "blob" }),
};
