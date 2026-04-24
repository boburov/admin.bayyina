import http from "@/shared/api/http";

export const recordsAPI = {
  getAll:      (params)                    => http.get("/records", { params }),
  getOne:      (id)                        => http.get(`/records/${id}`),
  getByEntity: (entityType, entityId, p)   => http.get(`/records/entity/${entityType}/${entityId}`, { params: p }),
};
