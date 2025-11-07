import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./app/store";
import AppRoutes from "./app/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./app/AuthContext";
import ToastProvider from "./components/ui/ToastProvider";
import { queryClient } from "./lib/queryClient";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
              <ToastProvider />
            </AuthProvider>
          </BrowserRouter>
        </Provider>
        {/* React Query DevTools - Only shows in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
