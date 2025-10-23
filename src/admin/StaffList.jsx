import { useState } from "react";

/**
 * StaffList - Display and manage staff/beauticians in admin panel
 *
 * @param {object} props
 * @param {Array} props.staff - Array of staff/beautician objects
 * @param {Array} props.services - Array of service objects (to show service assignments)
 * @param {function} props.onEdit - Callback(staff) when edit button clicked
 * @param {function} props.onDelete - Callback(staffId) when delete confirmed
 * @param {function} props.onCreate - Callback when create button clicked
 * @param {boolean} props.isLoading - Loading state
 */
export default function StaffList({
  staff,
  services = [],
  onEdit,
  onDelete,
  onCreate,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all"); // 'all', 'active', 'inactive'
  const [filterService, setFilterService] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // staff member being deleted

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialties?.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && member.active) ||
      (filterActive === "inactive" && !member.active);

    // Check if staff is assigned to the filtered service
    const matchesService =
      filterService === "all" ||
      services.some((s) => {
        if (s._id !== filterService) return false;

        // Compare as strings to handle ObjectId comparison
        const primaryId =
          typeof s.primaryBeauticianId === "object"
            ? s.primaryBeauticianId._id || s.primaryBeauticianId.toString()
            : s.primaryBeauticianId;

        const hasAsPrimary = primaryId === member._id;
        const hasAsAdditional = s.additionalBeauticianIds?.some((id) => {
          const additionalId =
            typeof id === "object" ? id._id || id.toString() : id;
          return additionalId === member._id;
        });

        return hasAsPrimary || hasAsAdditional;
      });

    return matchesSearch && matchesActive && matchesService;
  });

  // Get services assigned to a staff member
  const getAssignedServices = (staffId) => {
    return services.filter((s) => {
      // Compare as strings to handle ObjectId comparison
      const primaryId =
        typeof s.primaryBeauticianId === "object"
          ? s.primaryBeauticianId._id || s.primaryBeauticianId.toString()
          : s.primaryBeauticianId;
      return (
        primaryId === staffId ||
        s.additionalBeauticianIds?.some((id) => {
          const additionalId =
            typeof id === "object" ? id._id || id.toString() : id;
          return additionalId === staffId;
        })
      );
    });
  };

  const handleDeleteClick = (member) => {
    // Check if staff is assigned to any services
    const assignedServices = getAssignedServices(member._id);
    setDeleteConfirm({ member, assignedServices });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await onDelete(deleteConfirm.member._id);
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search staff by name, email, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Active Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Service Filter */}
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Services</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredStaff.length} of {staff.length} staff members
        </div>
      </div>

      {/* Staff Table / Cards */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            {staff.length === 0
              ? "No staff members yet"
              : "No staff match your filters"}
          </p>
          {staff.length === 0 && (
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              Add Your First Staff Member
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filteredStaff.map((member) => {
              const assignedServices = getAssignedServices(member._id);

              return (
                <div
                  key={member._id}
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                >
                  <div className="p-4">
                    {/* Staff Header */}
                    <div className="flex gap-3 mb-3">
                      {member.image ? (
                        <img
                          src={member.image.url}
                          alt={member.image.alt || member.name}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                          style={{
                            backgroundColor: member.color || "#3B82F6",
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {member.name}
                        </h3>
                        {member.bio && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {member.bio}
                          </p>
                        )}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-900">
                          {member.email || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-gray-900">
                          {member.phone || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Specialties & Services */}
                    <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
                      {member.specialties && member.specialties.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Specialties
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties.map((specialty, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {assignedServices.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Assigned Services
                          </div>
                          <div className="text-sm text-brand-600 font-medium">
                            {assignedServices.length} service
                            {assignedServices.length !== 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {assignedServices
                              .slice(0, 2)
                              .map((s) => s.name)
                              .join(", ")}
                            {assignedServices.length > 2 &&
                              ` +${assignedServices.length - 2} more`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(member)}
                        className="flex-1 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(member)}
                        className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((member) => {
                    const assignedServices = getAssignedServices(member._id);

                    return (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {member.image ? (
                              <img
                                src={member.image.url}
                                alt={member.image.alt || member.name}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-full mr-3 flex items-center justify-center text-white font-semibold"
                                style={{
                                  backgroundColor: member.color || "#3B82F6",
                                }}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.name}
                              </div>
                              {member.bio && (
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                  {member.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900">
                            {member.email || "—"}
                          </div>
                          <div className="text-gray-500">
                            {member.phone || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {member.specialties &&
                          member.specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {member.specialties
                                .slice(0, 2)
                                .map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex px-2 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              {member.specialties.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{member.specialties.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {assignedServices.length > 0 ? (
                            <div>
                              <span className="text-brand-600 font-medium">
                                {assignedServices.length} service
                                {assignedServices.length !== 1 ? "s" : ""}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {assignedServices
                                  .slice(0, 2)
                                  .map((s) => s.name)
                                  .join(", ")}
                                {assignedServices.length > 2 &&
                                  ` +${assignedServices.length - 2} more`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => onEdit(member)}
                            className="text-brand-600 hover:text-brand-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-2">Delete Staff Member</h3>

            {deleteConfirm.assignedServices.length > 0 ? (
              <>
                <p className="text-gray-600 mb-4">
                  "{deleteConfirm.member.name}" is currently assigned to{" "}
                  {deleteConfirm.assignedServices.length} service(s):
                </p>
                <ul className="list-disc list-inside mb-4 text-sm text-gray-700">
                  {deleteConfirm.assignedServices.map((service) => (
                    <li key={service._id}>{service.name}</li>
                  ))}
                </ul>
                <p className="text-orange-600 font-medium mb-4">
                  Please reassign these services before deleting this staff
                  member, or the backend will prevent deletion.
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{deleteConfirm.member.name}"?
                This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {deleteConfirm.assignedServices.length === 0 && (
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
