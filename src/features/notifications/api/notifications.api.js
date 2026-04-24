import http from "@/shared/api/http";

export const notificationsAPI = {
  getAll:         (params)                  => http.get("/notifications", { params }),
  getOne:         (id)                      => http.get(`/notifications/${id}`),
  send:           (data)                    => http.post("/notifications", data),
  updateStatus:   (id, status)              => http.patch(`/notifications/${id}/status`, { status }),
  addFeedback:    (id, data)                => http.post(`/notifications/${id}/feedback`, data),
  updateFeedback: (id, feedbackId, data)    => http.put(`/notifications/${id}/feedback/${feedbackId}`, data),
  deleteFeedback: (id, feedbackId)          => http.delete(`/notifications/${id}/feedback/${feedbackId}`),
  remove:         (id)                      => http.delete(`/notifications/${id}`),
};
