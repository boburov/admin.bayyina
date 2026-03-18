import http from "@/shared/api/http";

export const marketAPI = {
  getProducts: (params) => http.get("/market/admin/products", { params }),
  getProductById: (productId) => http.get(`/market/admin/products/${productId}`),
  createProduct: (data, config = {}) =>
    http.post("/market/admin/products", data, {
      ...config,
      headers: {
        ...(config.headers || {}),
        "Content-Type": "multipart/form-data",
      },
    }),
  updateProduct: (productId, data, config = {}) =>
    http.put(`/market/admin/products/${productId}`, data, {
      ...config,
      headers: {
        ...(config.headers || {}),
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteProduct: (productId) => http.delete(`/market/admin/products/${productId}`),
  getOrders: (params) => http.get("/market/admin/orders", { params }),
  updateOrderStatus: (orderId, data) =>
    http.patch(`/market/admin/orders/${orderId}/status`, data),
};
