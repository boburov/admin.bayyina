import http from "@/shared/api/http";

export const messagesAPI = {
  getAll: (params) => http.get("/messages", { params }),
  getOne: (id) => http.get(`/messages/${id}`),
  send: (data) => {
    const formData = new FormData();
    formData.append("messageText", data.messageText);
    formData.append("recipientType", data.recipientType);

    if (data.classId) formData.append("classId", data.classId);
    if (data.studentId) formData.append("studentId", data.studentId);
    if (data.file) formData.append("file", data.file);

    return http.post("/messages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
