import http from "@/shared/api/http";

export const coinDistributionAPI = {
  distribute: (data) => http.post("/coins/distribute", data),
};
