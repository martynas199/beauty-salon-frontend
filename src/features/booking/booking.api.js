import { api } from "../../lib/apiClient"; export const BookingAPI = { reserveWithoutPayment: async(b)=> (await api.post("/appointments", b)).data };
