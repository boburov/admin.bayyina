import http from "@/shared/api/http";

export const ratingsAPI = {
  getStats: (params) =>
    http.get("/attendance/der/stats", { params }),

  getConfig: () =>
    http.get("/attendance/der/config"),

  updateConfig: (data) =>
    http.put("/attendance/der/config", data),
};
