import { api } from "../../lib/apiClient";

export const RevenueAPI = {
  /**
   * Get revenue analytics for a date range
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Revenue data with beauticians array
   */
  async getRevenue(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await api.get(`/revenue?${params}`);
    return res.data;
  },
};
