import http from "@/shared/api/http";

export const attendanceAPI = {
  getSummary: (groupId, month) =>
    http.get("/attendance/summary", { params: { group: groupId, month } }),
};
