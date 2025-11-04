import { createSlice } from "@reduxjs/toolkit";

// Get initial state from localStorage
const token = localStorage.getItem("authToken");
const admin = localStorage.getItem("admin");

const initialState = {
  token: token || null,
  admin: admin ? JSON.parse(admin) : null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
      state.error = null;

      // Persist to localStorage
      localStorage.setItem("authToken", action.payload.token);
      localStorage.setItem("admin", JSON.stringify(action.payload.admin));
    },
    clearAuth: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("admin");
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateAdmin: (state, action) => {
      state.admin = { ...state.admin, ...action.payload };

      // Update localStorage
      localStorage.setItem("admin", JSON.stringify(state.admin));
    },
  },
});

export const { setAuth, clearAuth, setAuthLoading, setAuthError, updateAdmin } =
  authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAdmin = (state) => state.auth.admin;
export const selectAuthToken = (state) => state.auth.token;

export default authSlice.reducer;
