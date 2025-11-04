import { configureStore } from "@reduxjs/toolkit";
import booking from "../features/booking/bookingSlice";
import auth from "../features/auth/authSlice";
import cart from "../features/cart/cartSlice";

export const store = configureStore({
  reducer: {
    booking,
    auth,
    cart,
  },
});
