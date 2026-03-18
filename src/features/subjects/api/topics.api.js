import http from "@/shared/api/http";

export const topicsAPI = {
  upload: (file, subjectId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (subjectId) formData.append("subjectId", subjectId);

    return http.post("/topics/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getBySubject: (subjectId) => http.get(`/topics/subject/${subjectId}`),
  deleteBySubject: (subjectId) => http.delete(`/topics/subject/${subjectId}`),
};
