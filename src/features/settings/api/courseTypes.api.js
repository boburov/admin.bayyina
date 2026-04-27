import http from "@/shared/api/http";

export const courseTypesAPI = {
  getAll:  (params) => http.get("/course-types", { params }),
  create:  (data)   => http.post("/course-types", data),
  update:  (id, data) => http.put(`/course-types/${id}`, data),
  delete:  (id)     => http.delete(`/course-types/${id}`),
};
