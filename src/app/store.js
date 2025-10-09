import { configureStore } from "@reduxjs/toolkit"; import booking from "../features/booking/bookingSlice"; export const store = configureStore({ reducer: { booking } });
