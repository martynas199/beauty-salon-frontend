import { api } from "../../lib/apiClient";

export const LocationsAPI = {
  list: async (all = false) => {
    const params = all ? "?all=true" : "";
    const response = await api.get(`/locations${params}`);
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/locations", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/locations/${id}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteImage: async (id) => {
    const response = await api.delete(`/locations/${id}/image`);
    return response.data;
  },
};
