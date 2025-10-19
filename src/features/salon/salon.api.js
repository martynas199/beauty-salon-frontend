import { api } from "../../lib/apiClient";
export const SalonAPI = {
  get: async () => (await api.get("/salon")).data,
};

