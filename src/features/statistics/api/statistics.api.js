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
  getStudents:   (params) => http.get("/statistics/students", { params }),
  getLeads:      (params) => http.get("/statistics/leads", { params }),
  getRevenue:    (params) => http.get("/statistics/revenue", { params }),
  getAttendance: (params) => http.get("/statistics/attendance", { params }),
  getLeadManagers: (params) => http.get("/statistics/leads/managers", { params }),
  getMonthlyIncome: (params) => http.get("/statistics/monthly-income", { params }),
};
