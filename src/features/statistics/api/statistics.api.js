import http from "@/shared/api/http";

export const statisticsAPI = {
  getStudentWeekly: (studentId) =>
    http.get(`/statistics/weekly/current/${studentId}`),
  getClassRankings: (classId, params) =>
    http.get(`/statistics/weekly/class/${classId}/rankings`, { params }),
  getSchoolRankings: (params) =>
    http.get("/statistics/weekly/school/rankings", { params }),
  export: (params) =>
    http.get("/statistics/weekly/export", { params, responseType: "blob" }),

  getOverview:   () => http.get("/statistics/overview"),
  getStudents:   () => http.get("/statistics/students"),
  getLeads:      () => http.get("/statistics/leads"),
  getRevenue:    () => http.get("/statistics/revenue"),
  getAttendance: () => http.get("/statistics/attendance"),
};
