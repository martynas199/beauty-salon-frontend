import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./app/store";
import AppRoutes from "./app/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./app/AuthContext";
import ToastProvider from "./components/ui/ToastProvider";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <ToastProvider />
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
