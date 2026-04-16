import http from "@/shared/api/http";

export const notificationsAPI = {
  getAll: (params) => http.get("/notifications", { params }),
  getOne: (id) => http.get(`/notifications/${id}`),
  send: (data) => http.post("/notifications", data),
  updateStatus: (id, status) => http.patch(`/notifications/${id}/status`, { status }),
};
