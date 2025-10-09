import axios from "axios";
import { env } from "./env";
export const api = axios.create({ baseURL: `${env.API_URL}/api`, timeout: 15000 });
api.interceptors.response.use((r)=>r,(err)=>Promise.reject(new Error(err?.response?.data?.error||err?.message||"Unknown error")));
