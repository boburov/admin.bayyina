import http from "@/shared/api/http";

export const penaltiesAPI = {
  // Sozlamalar
  getSettings: () => http.get("/penalties/settings"),
  updateSettings: (data) => http.put("/penalties/settings", data),

  // Statistika
  getStats: () => http.get("/penalties/stats"),

  // Kategoriyalar
  getCategories: (params) => http.get("/penalties/categories", { params }),
  createPenaltyCategory: (data) => http.post("/penalties/categories", data),
  updateCategory: (id, data) => http.put(`/penalties/categories/${id}`, data),
  deleteCategory: (id) => http.delete(`/penalties/categories/${id}`),

  // Jarimalar
  getAll: (params) => http.get("/penalties", { params }),
  getPending: (params) => http.get("/penalties/pending", { params }),
  getById: (id) => http.get(`/penalties/${id}`),
  getUserPenalties: (userId, params) =>
    http.get(`/penalties/user/${userId}`, { params }),
  create: (data) =>
    http.post("/penalties", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  review: (id, data) => http.put(`/penalties/${id}/review`, data),

  // Kamaytirish
  reduce: (data) => http.post("/penalties/reduce", data),
  getReductions: (params) => http.get("/penalties/reductions", { params }),

  // O'z jarimalari
  getMyPenalties: (params) => http.get("/penalties/my", { params }),
};
