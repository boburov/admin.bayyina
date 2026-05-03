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
};
