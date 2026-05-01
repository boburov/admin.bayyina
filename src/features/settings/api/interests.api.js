import http from "@/shared/api/http";

export const interestsAPI = {
  getAll:  (params)    => http.get("/interests", { params }),
  create:  (data)      => http.post("/interests", data),
  update:  (id, data)  => http.put(`/interests/${id}`, data),
  delete:  (id)        => http.delete(`/interests/${id}`),
};
