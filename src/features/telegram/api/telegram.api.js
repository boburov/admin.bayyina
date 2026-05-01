import http from "@/shared/api/http";

export const telegramAPI = {
  getStats: () => http.get("/telegram/stats"),
  sendMessage: (data) => http.post("/telegram/send", data),
};
