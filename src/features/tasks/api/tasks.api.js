import http from "@/shared/api/http";

export const tasksAPI = {
  // Barcha topshiriqlar (owner)
  getAll: (params) => http.get("/tasks", { params }),

  // O'z topshiriqlari (authenticated user)
  getMy: (params) => http.get("/tasks/my", { params }),

  // Bitta topshiriq tafsilotlari
  getById: (id) => http.get(`/tasks/${id}`),

  // Topshiriq yaratish (multipart/form-data)
  create: (formData) =>
    http.post("/tasks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Ijrochi topshiriqni yakunladi deb belgilaydi (multipart/form-data)
  submitCompletion: (id, formData) =>
    http.put(`/tasks/${id}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Owner tasdiqlaydi
  approve: (id, data) => http.put(`/tasks/${id}/approve`, data),

  // Owner rad etadi
  reject: (id, data) => http.put(`/tasks/${id}/reject`, data),

  // Owner to'xtatadi
  stop: (id, data) => http.put(`/tasks/${id}/stop`, data),

  // Owner muddatni uzaytiradi
  extend: (id, data) => http.put(`/tasks/${id}/extend`, data),
};
