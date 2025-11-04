import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, updateAdmin } from "../features/auth/authSlice";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useEffect, useState } from "react";
import { api } from "../lib/apiClient";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Verify token with backend
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        setVerifying(false);
        return;
      }

      try {
        // Call /auth/me to verify token is still valid
        const response = await api.get("/auth/me");
        if (response.data.success && response.data.admin) {
          setIsValid(true);
          // Update Redux with fresh admin data (includes active field)
          dispatch(updateAdmin(response.data.admin));
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsValid(false);
        // Clear invalid token
        localStorage.removeItem("authToken");
        localStorage.removeItem("admin");
      } finally {
        setVerifying(false);
      }
    };

    verifyAuth();
  }, [isAuthenticated, dispatch]);

  // Show loading spinner while verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated or token is invalid
  if (!isAuthenticated || !isValid) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return children;
}
