import { createSlice } from "@reduxjs/toolkit";
const initial = {
  serviceId: undefined,
  variantName: undefined,
  beauticianId: undefined,
  any: false,
  date: undefined,
  startISO: undefined,
  client: undefined,
  price: undefined,
  durationMin: undefined,
  bufferBeforeMin: undefined,
  bufferAfterMin: undefined,
  mode: undefined,
  appointmentId: undefined,
};
const slice = createSlice({
  name: "booking",
  initialState: initial,
  reducers: {
    setService(s, { payload }) {
      Object.assign(s, {
        serviceId: payload.serviceId,
        variantName: payload.variantName,
        price: payload.price,
        durationMin: payload.durationMin,
        bufferBeforeMin: payload.bufferBeforeMin,
        bufferAfterMin: payload.bufferAfterMin,
      });
    },
    setBeautician(s, { payload }) {
      Object.assign(s, {
        beauticianId: payload.beauticianId,
        any: !!payload.any,
      });
    },
    setDate(s, { payload }) {
      s.date = payload;
    },
    setSlot(s, { payload }) {
      s.startISO = payload;
    },
    setClient(s, { payload }) {
      s.client = payload;
    },
    setMode(s, { payload }) {
      s.mode = payload;
    },
    setAppointmentId(s, { payload }) {
      s.appointmentId = payload;
    },
    reset() {
      return initial;
    },
  },
});
export const {
  setService,
  setBeautician,
  setDate,
  setSlot,
  setClient,
  setMode,
  setAppointmentId,
  reset,
} = slice.actions;
export default slice.reducer;
