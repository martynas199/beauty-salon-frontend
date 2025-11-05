import { useState, useEffect } from "react";
import { api } from "../../lib/apiClient";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function AdminBeauticianLink() {
  const [admins, setAdmins] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedBeautician, setSelectedBeautician] = useState("");
  const [linking, setLinking] = useState(false);
  const [searchAdmin, setSearchAdmin] = useState("");
  const [searchBeautician, setSearchBeautician] = useState("");

  // Create admin form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    beauticianId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      // Fetch admins
      const adminsRes = await api.get("/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch beauticians
      const beauticiansRes = await api.get("/beauticians");

      setAdmins(adminsRes.data || []);
      setBeauticians(beauticiansRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load admins and beauticians");
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedAdmin || !selectedBeautician) {
      toast.error("Please select both an admin and a beautician");
      return;
    }

    setLinking(true);
    try {
      const token = localStorage.getItem("adminToken");
      await api.patch(
        `/admin/admins/${selectedAdmin}/link-beautician`,
        { beauticianId: selectedBeautician },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Successfully linked admin to beautician!");
      loadData(); // Reload to show updated links
      setSelectedAdmin("");
      setSelectedBeautician("");
    } catch (error) {
      console.error("Failed to link:", error);
      toast.error(
        error.response?.data?.error || "Failed to link admin to beautician"
      );
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (adminId) => {
    if (
      !confirm(
        "Are you sure you want to unlink this admin from their beautician?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await api.patch(
        `/admin/admins/${adminId}/link-beautician`,
        { beauticianId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Successfully unlinked admin from beautician");
      loadData();
    } catch (error) {
      console.error("Failed to unlink:", error);
      toast.error("Failed to unlink admin");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    // Validation
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newAdmin.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("adminToken");
      await api.post(
        "/admin/admins",
        {
          name: newAdmin.name,
          email: newAdmin.email,
          password: newAdmin.password,
          role: newAdmin.role,
          beauticianId: newAdmin.beauticianId || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Admin created successfully!");
      setShowCreateForm(false);
      setNewAdmin({
        name: "",
        email: "",
        password: "",
        role: "admin",
        beauticianId: "",
      });
      loadData(); // Reload admins list
    } catch (error) {
      console.error("Failed to create admin:", error);
      toast.error(error.response?.data?.error || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const getBeauticianName = (beauticianId) => {
    const beautician = beauticians.find((b) => b._id === beauticianId);
    return beautician ? beautician.name : "Unknown";
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  const filteredBeauticians = beauticians.filter(
    (beautician) =>
      beautician.name.toLowerCase().includes(searchBeautician.toLowerCase()) ||
      (beautician.email || "")
        .toLowerCase()
        .includes(searchBeautician.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-wide">
            Admin Management
          </h1>
          <p className="mt-2 text-gray-600 font-light">
            Create admin accounts and link them to beautician profiles
          </p>
        </div>
        <Button
          variant="brand"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="whitespace-nowrap"
        >
          {showCreateForm ? "Cancel" : "+ Create New Admin"}
        </Button>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <Card className="p-6 border-4 border-brand-400 shadow-lg">
          <h2 className="text-xl font-serif font-semibold mb-4 tracking-wide">
            Create New Admin Account
          </h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter admin name"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Link to Beautician (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Beautician (Optional)
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  value={newAdmin.beauticianId}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, beauticianId: e.target.value })
                  }
                >
                  <option value="">None - No beautician link</option>
                  {beauticians.map((beautician) => (
                    <option key={beautician._id} value={beautician._id}>
                      {beautician.name}{" "}
                      {beautician.email ? `(${beautician.email})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Link this admin to a beautician for Stripe Connect management
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="brand"
                loading={creating}
                disabled={creating}
                fullWidth
              >
                Create Admin Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewAdmin({
                    name: "",
                    email: "",
                    password: "",
                    role: "admin",
                    beauticianId: "",
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Link Existing Admin to Beautician */}
      <Card className="p-6">
        <h2 className="text-xl font-serif font-semibold mb-4 tracking-wide">
          Link Existing Admin to Beautician
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Select Admin */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Admin
            </label>
            <Input
              placeholder="Search admin by name or email..."
              value={searchAdmin}
              onChange={(e) => setSearchAdmin(e.target.value)}
              className="mb-2"
            />
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredAdmins.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No admins found
                </div>
              ) : (
                filteredAdmins.map((admin) => (
                  <button
                    key={admin._id}
                    onClick={() => setSelectedAdmin(admin._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-brand-50 transition-colors ${
                      selectedAdmin === admin._id
                        ? "bg-brand-100 border-l-4 border-l-brand-600"
                        : ""
                    }`}
                  >
                    <div className="font-medium">{admin.name}</div>
                    <div className="text-sm text-gray-600">{admin.email}</div>
                    {admin.beauticianId && (
                      <div className="text-xs text-brand-700 mt-1">
                        Currently linked to:{" "}
                        {getBeauticianName(admin.beauticianId)}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Select Beautician */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Beautician
            </label>
            <Input
              placeholder="Search beautician by name or email..."
              value={searchBeautician}
              onChange={(e) => setSearchBeautician(e.target.value)}
              className="mb-2"
            />
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredBeauticians.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No beauticians found
                </div>
              ) : (
                filteredBeauticians.map((beautician) => (
                  <button
                    key={beautician._id}
                    onClick={() => setSelectedBeautician(beautician._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-brand-50 transition-colors ${
                      selectedBeautician === beautician._id
                        ? "bg-brand-100 border-l-4 border-l-brand-600"
                        : ""
                    }`}
                  >
                    <div className="font-medium">{beautician.name}</div>
                    <div className="text-sm text-gray-600">
                      {beautician.email || "No email"}
                    </div>
                    {beautician.specialty && (
                      <div className="text-xs text-gray-500 mt-1">
                        Specialty: {beautician.specialty}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Link Button */}
        <div className="mt-6">
          <Button
            variant="brand"
            onClick={handleLink}
            loading={linking}
            disabled={!selectedAdmin || !selectedBeautician}
            fullWidth
          >
            Link Admin to Beautician
          </Button>
          {selectedAdmin && selectedBeautician && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Linking: {admins.find((a) => a._id === selectedAdmin)?.name} →{" "}
              {beauticians.find((b) => b._id === selectedBeautician)?.name}
            </p>
          )}
        </div>
      </Card>

      {/* Current Links */}
      <Card className="p-4 sm:p-6 overflow-hidden">
        <h2 className="text-lg sm:text-xl font-serif font-semibold mb-4 tracking-wide break-words">
          Current Links
        </h2>
        <div className="space-y-3">
          {admins.filter((admin) => admin.beauticianId).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <p className="font-medium">No links created yet</p>
              <p className="text-sm">
                Use the form above to link an admin to a beautician
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linked Beautician
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins
                    .filter((admin) => admin.beauticianId)
                    .map((admin) => {
                      const beautician = beauticians.find(
                        (b) => b._id === admin.beauticianId
                      );
                      return (
                        <tr key={admin._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="font-medium text-gray-900 text-sm break-words">
                              {admin.name}
                            </div>
                            <div className="sm:hidden text-xs text-gray-600 mt-1 break-all">
                              {admin.email}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 break-all">
                              {admin.email}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="font-medium text-brand-700 text-sm break-words">
                              {beautician?.name || "Unknown"}
                            </div>
                            {beautician?.email && (
                              <div className="text-xs text-gray-500 break-all">
                                {beautician.email}
                              </div>
                            )}
                            <span className="md:hidden inline-flex mt-1 px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Linked
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Linked
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right text-sm">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUnlink(admin._id)}
                              className="text-xs sm:text-sm"
                            >
                              Unlink
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0"
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
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              About Admin-Beautician Links
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Linking an admin to a beautician allows the admin to manage
                that beautician's Stripe Connect settings
              </li>
              <li>
                • Each admin can only be linked to one beautician at a time
              </li>
              <li>
                • Unlinking will remove access to Stripe Connect management
              </li>
              <li>
                • The admin must log out and log back in to see changes take
                effect
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
