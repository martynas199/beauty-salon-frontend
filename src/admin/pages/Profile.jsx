import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../../lib/apiClient";
import { selectAdmin, updateAdmin } from "../../features/auth/authSlice";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormField from "../../components/forms/FormField";

export default function Profile() {
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");
    }
  }, [admin]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const response = await api.patch("/auth/me", {
        name,
        email,
      });

      if (response.data.success && response.data.admin) {
        // Update Redux store with new admin data
        dispatch(updateAdmin(response.data.admin));
        setProfileSuccess("Profile updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileError(
        err.response?.data?.error ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        setPasswordSuccess("Password changed successfully!");

        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Clear success message after 3 seconds
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordError(
        err.response?.data?.error ||
          "Failed to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and security settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <div className="flex items-center gap-6 p-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {getInitials(admin?.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {admin?.name || "Admin User"}
            </h2>
            <p className="text-gray-600 mb-1">{admin?.email}</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-brand-100 text-brand-700 text-sm font-medium rounded-full capitalize">
                {admin?.role || "administrator"}
              </span>
              {admin?.active !== undefined && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
                    admin.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      admin.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {admin.active ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Information Form */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h3>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-green-700">{profileSuccess}</p>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-sm text-red-700">{profileError}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <FormField label="Full Name" htmlFor="name" required>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                disabled={profileLoading}
              />
            </FormField>

            <FormField label="Email Address" htmlFor="email" required>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                disabled={profileLoading}
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                loading={profileLoading}
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setName(admin?.name || "");
                  setEmail(admin?.email || "");
                  setProfileError("");
                  setProfileSuccess("");
                }}
                disabled={profileLoading}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Change Password Form */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">
              Change Password
            </h3>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Password Requirements:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>At least 8 characters long</li>
                <li>Different from your current password</li>
                <li>Consider using a mix of letters, numbers, and symbols</li>
              </ul>
            </p>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-green-700">{passwordSuccess}</p>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <FormField
              label="Current Password"
              htmlFor="currentPassword"
              required
            >
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                autoComplete="current-password"
                disabled={passwordLoading}
              />
            </FormField>

            <FormField label="New Password" htmlFor="newPassword" required>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                autoComplete="new-password"
                minLength={8}
                disabled={passwordLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </FormField>

            <FormField
              label="Confirm New Password"
              htmlFor="confirmPassword"
              required
            >
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                autoComplete="new-password"
                minLength={8}
                disabled={passwordLoading}
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                loading={passwordLoading}
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                disabled={passwordLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Account Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">
              Account Information
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Account ID</p>
                <p className="text-sm text-gray-500 font-mono">
                  {admin?._id || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-sm text-gray-500 capitalize">
                  {admin?.role || "administrator"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
                    admin?.active
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      admin?.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {admin?.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {admin?.lastLogin && (
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Last Login
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(admin.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
