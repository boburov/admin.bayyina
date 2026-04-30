import http from "./http";

export const selectOptionsAPI = {
  getOptions: (type) => http.get("/select-options", { params: { type } }),
  getTypes:   ()     => http.get("/select-options/types"),
};
