import http from "@/shared/api/http";

export const authAPI = {
  login: (data) => http.post("auth/login", data),
  sendOtp: (data) => http.post("auth/send-otp", data),
  verifyOtp: (data) => http.post("auth/verify-otp", data),
  getMe: () => http.get("auth/profile"),
};
