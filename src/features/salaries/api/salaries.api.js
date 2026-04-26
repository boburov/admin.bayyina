import http from "@/shared/api/http";

export const salariesAPI = {
  getAll:    (params) => http.get("/salaries", { params }),
  getOne:    (id)     => http.get(`/salaries/${id}`),
  create:    (data)   => http.post("/salaries", data),
  update:    (id, data) => http.put(`/salaries/${id}`, data),
  delete:    (id)     => http.delete(`/salaries/${id}`),
  pay:       (id)     => http.post(`/salaries/${id}/pay`),
  calculate: (data)   => http.post("/salaries/calculate", data),
  generate:  (data)   => http.post("/salaries/generate", data),
};
