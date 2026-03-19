import http from "@/shared/api/http";

/**
 * Monitor sozlamalari API.
 * @property {Function} getSettings - Monitor sozlamalarini olish
 * @property {Function} updateSettings - Monitor sozlamalarini yangilash
 */
export const monitorsAPI = {
  getSettings: () => http.get("/monitor/admin/settings"),
  updateSettings: (data) => http.put("/monitor/admin/settings", data),
};
