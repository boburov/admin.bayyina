import http from "@/shared/api/http";

export const leadSourcesAPI = {
  getAll:  (params) => http.get("/lead-sources", { params }),
  create:  (data)   => http.post("/lead-sources", data),
  update:  (id, data) => http.put(`/lead-sources/${id}`, data),
  delete:  (id)     => http.delete(`/lead-sources/${id}`),
};
