﻿import { api } from "../../lib/apiClient"; export const CheckoutAPI = { createSession: async(b)=> (await api.post("/checkout/create-session", b)).data };
