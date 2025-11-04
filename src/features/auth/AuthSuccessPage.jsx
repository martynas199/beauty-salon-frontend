import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function AuthSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token from URL query params
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
          // Store new token in localStorage
          localStorage.setItem("userToken", token);

          // Use window.location to force a full page reload with the new token
          // This will cause AuthContext to load fresh with the new token
          window.location.href = "/profile";
        } else {
          // No token found, redirect to login with error
          navigate("/login?error=auth_failed", { replace: true });
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/login?error=auth_failed", { replace: true });
      }
    };

    handleOAuthCallback();
  }, [location, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-gray-700 font-medium">
          Signing you in...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}
