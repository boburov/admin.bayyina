import http from "@/shared/api/http";

export const salariesAPI = {
  getAll:    (params) => http.get("/salaries", { params }),
  getOne:    (id)     => http.get(`/salaries/${id}`),
  create:    (data)   => http.post("/salaries", data),
  update:    (id, data) => http.put(`/salaries/${id}`, data),
  delete:    (id)     => http.delete(`/salaries/${id}`),
  pay:       (id, data) => http.post(`/salaries/${id}/pay`, data),
  bulkPay:   (data)   => http.post("/salaries/bulk-pay", data),
  calculate: (params) => http.get("/salaries/calculate", { params }),
  generate:  (data)   => http.post("/salaries/generate", data),

  // Deductions
  deductions: {
    getAll:   (params) => http.get("/salaries/deductions", { params }),
    create:   (data)   => http.post("/salaries/deductions", data),
    confirm:  (id)     => http.put(`/salaries/deductions/${id}/confirm`),
    delete:   (id)     => http.delete(`/salaries/deductions/${id}`),
  },

  // Advances
  advances: {
    getAll:   (params) => http.get("/salaries/advances", { params }),
    create:   (data)   => http.post("/salaries/advances", data),
    request:  (data)   => http.post("/salaries/advances/request", data),
    confirm:  (id)     => http.put(`/salaries/advances/${id}/confirm`),
    delete:   (id)     => http.delete(`/salaries/advances/${id}`),
  },
};
