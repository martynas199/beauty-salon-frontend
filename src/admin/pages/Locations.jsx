import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import { LocationsAPI } from "../../features/locations/locations.api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function Locations({ embedded = false }) {
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Access denied. Super admin only.");
      return;
    }
    loadLocations();
  }, [isSuperAdmin]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await LocationsAPI.list(true); // Get all including inactive
      setLocations(data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLocation({
      name: "",
      address: {
        street: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
      },
      contact: {
        phone: "",
        email: "",
      },
      description: "",
      active: true,
      order: 0,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setEditingLocation({ ...location });
    setImagePreview(location.image?.url || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingLocation.name) {
      toast.error("Please enter a location name");
      return;
    }

    try {
      setSaving(true);

      let savedLocation;
      if (editingLocation._id) {
        // Update existing
        savedLocation = await LocationsAPI.update(
          editingLocation._id,
          editingLocation,
        );
      } else {
        // Create new
        savedLocation = await LocationsAPI.create(editingLocation);
      }

      // Upload image if selected
      if (imageFile) {
        await LocationsAPI.uploadImage(savedLocation._id, imageFile);
      }

      await loadLocations();
      setShowForm(false);
      setEditingLocation(null);
      setImageFile(null);
      setImagePreview(null);
      toast.success(
        editingLocation._id
          ? "Location updated successfully"
          : "Location created successfully",
      );
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error("Failed to save location: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      await LocationsAPI.delete(id);
      await loadLocations();
      if (editingLocation?._id === id) {
        setShowForm(false);
        setEditingLocation(null);
      }
      toast.success("Location deleted successfully");
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error("Failed to delete location: " + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
    setImageFile(null);
    setImagePreview(null);
  };

  if (!isSuperAdmin) {
    if (embedded) return null;
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-gray-600">
            Access denied. Only super administrators can manage locations.
          </p>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className={embedded ? "" : "max-w-4xl mx-auto p-6"}>
        {!embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {editingLocation._id ? "Edit Location" : "Create Location"}
            </h1>
            <p className="text-gray-600">
              Manage salon locations where beauticians work
            </p>
          </div>
        )}

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <Input
                    value={editingLocation.name || ""}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Peterborough, Wisbech"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    rows="3"
                    value={editingLocation.description || ""}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of this location..."
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <Input
                    value={editingLocation.address?.street || ""}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        address: {
                          ...editingLocation.address,
                          street: e.target.value,
                        },
                      })
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      value={editingLocation.address?.city || ""}
                      onChange={(e) =>
                        setEditingLocation({
                          ...editingLocation,
                          address: {
                            ...editingLocation.address,
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="Peterborough"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postcode
                    </label>
                    <Input
                      value={editingLocation.address?.postcode || ""}
                      onChange={(e) =>
                        setEditingLocation({
                          ...editingLocation,
                          address: {
                            ...editingLocation.address,
                            postcode: e.target.value,
                          },
                        })
                      }
                      placeholder="PE1 1XX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={editingLocation.address?.country || "United Kingdom"}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        address: {
                          ...editingLocation.address,
                          country: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={editingLocation.contact?.phone || ""}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        contact: {
                          ...editingLocation.contact,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="+44 1234 567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editingLocation.contact?.email || ""}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        contact: {
                          ...editingLocation.contact,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="location@salon.com"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Location Image
              </h3>

              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 800x600px landscape image
                </p>
              </div>
            </div>

            {/* Display Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editingLocation.active || false}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        active: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Active (visible on landing page)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={editingLocation.order || 0}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              {editingLocation._id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDelete(editingLocation._id)}
                  disabled={saving}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="brand" loading={saving}>
                {editingLocation._id ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "p-4 sm:p-6"}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        {!embedded ? (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Locations</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage salon locations where beauticians work
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button
          variant="brand"
          onClick={handleCreate}
          className="w-full sm:w-auto"
        >
          + Add Location
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : locations.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No locations yet
          </h3>
          <p className="text-gray-500 mb-4">Create your first salon location</p>
          <Button variant="brand" onClick={handleCreate}>
            Create Location
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {locations.map((location) => (
            <Card
              key={location._id}
              className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Location Image */}
                {location.image?.url && (
                  <img
                    src={location.image.url}
                    alt={location.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        {location.name}
                      </h3>
                      {location.address?.city && (
                        <p className="text-sm text-gray-600">
                          {location.address.street &&
                            `${location.address.street}, `}
                          {location.address.city}
                          {location.address.postcode &&
                            `, ${location.address.postcode}`}
                        </p>
                      )}
                      {location.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {location.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {location.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {location.contact?.phone && (
                      <span>📞 {location.contact.phone}</span>
                    )}
                    {location.contact?.email && (
                      <span>✉️ {location.contact.email}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(location)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(location._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
