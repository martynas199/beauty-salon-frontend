import { api } from "../../lib/apiClient"; export const StaffAPI = { byService: async(serviceId)=> (await api.get("/beauticians",{ params:{ serviceId } })).data };
