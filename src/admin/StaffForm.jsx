import { useState, useEffect } from "react";
import { useImageUpload } from "../hooks/useImageUpload";

/**
 * StaffForm - Create or Edit a beautician/staff member
 *
 * @param {object} props
 * @param {object|null} props.staff - Existing staff for edit mode, null for create mode
 * @param {function} props.onSave - Callback(staffData) when form is submitted
 * @param {function} props.onCancel - Callback when user cancels
 * @param {function} props.onDelete - Callback when user deletes (edit mode only)
 */
export default function StaffForm({ staff, onSave, onCancel, onDelete }) {
  const isEditMode = Boolean(staff);
  const { uploadImage, isUploading: isUploadingImage } = useImageUpload();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialties: [],
    active: true,
    color: "#3B82F6",
    image: null,
    workingHours: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  // Load existing staff data in edit mode
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        bio: staff.bio || "",
        specialties: staff.specialties || [],
        active: staff.active !== undefined ? staff.active : true,
        color: staff.color || "#3B82F6",
        image: staff.image || null,
        workingHours: staff.workingHours || [],
      });
    }
  }, [staff]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    try {
      const uploadedImage = await uploadImage(file, { alt: formData.name });
      setFormData((prev) => ({ ...prev, image: uploadedImage }));
      setErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message }));
    }
  };

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return;

    if (formData.specialties.includes(newSpecialty.trim())) {
      alert("This specialty is already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialty.trim()],
    }));
    setNewSpecialty("");
  };

  const removeSpecialty = (index) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const addWorkingHours = () => {
    setFormData((prev) => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { dayOfWeek: 1, start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeWorkingHours = (index) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index),
    }));
  };

  const handleWorkingHoursChange = (index, field, value) => {
    const newWorkingHours = [...formData.workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    setFormData((prev) => ({ ...prev, workingHours: newWorkingHours }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a staff member name";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = "Please enter a valid hex color (e.g., #3B82F6)";
    }

    // Validate working hours
    formData.workingHours.forEach((wh, i) => {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(wh.start)) {
        newErrors[`workingHours_${i}_start`] =
          "Please enter start time in HH:mm format (e.g., 09:00)";
      }
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(wh.end)) {
        newErrors[`workingHours_${i}_end`] =
          "Please enter end time in HH:mm format (e.g., 17:00)";
      }
      if (wh.start >= wh.end) {
        newErrors[`workingHours_${i}_range`] =
          "End time must be after start time";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
      setIsSubmitting(false);
    }
  };

  const errorCount = Object.keys(errors).filter(
    (key) => key !== "submit"
  ).length;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Staff Member" : "Add New Staff Member"}
      </h2>

      {errorCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Please fix the following {errorCount} error
                {errorCount !== 1 ? "s" : ""}:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                {Object.entries(errors)
                  .filter(([key]) => key !== "submit")
                  .map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            Basic Information
          </h3>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="staff@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              placeholder="+44 20 1234 5678"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio / Description
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              placeholder="Tell us about this staff member..."
            />
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium mb-1">
              Calendar Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                  errors.color ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="#3B82F6"
              />
            </div>
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              Profile Photo
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
            {isUploadingImage && (
              <p className="text-sm text-gray-500 mt-1">Uploading...</p>
            )}
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image.url}
                  alt={formData.image.alt || "Profile photo"}
                  className="w-32 h-32 object-cover rounded-full"
                />
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange("active", e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active (can accept bookings)
            </label>
          </div>
        </div>

        {/* Specialties Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Specialties</h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSpecialty())
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              placeholder="e.g., Haircuts, Coloring, Styling"
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              Add
            </button>
          </div>

          {formData.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="text-brand-600 hover:text-brand-800"
                    aria-label={`Remove ${specialty}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Working Hours Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold">Working Hours</h3>
            <button
              type="button"
              onClick={addWorkingHours}
              className="px-3 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm"
            >
              + Add Hours
            </button>
          </div>

          {formData.workingHours.length === 0 && (
            <p className="text-gray-500 text-sm">
              No working hours set. Add hours to specify availability.
            </p>
          )}

          {formData.workingHours.map((wh, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Schedule {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeWorkingHours(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Day of Week
                  </label>
                  <select
                    value={wh.dayOfWeek}
                    onChange={(e) =>
                      handleWorkingHoursChange(
                        index,
                        "dayOfWeek",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={wh.start}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, "start", e.target.value)
                    }
                    style={{ minWidth: 0 }}
                    className={`w-full max-w-full px-2 py-2 border rounded-lg text-sm ${
                      errors[`workingHours_${index}_start`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`workingHours_${index}_start`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`workingHours_${index}_start`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={wh.end}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, "end", e.target.value)
                    }
                    style={{ minWidth: 0 }}
                    className={`w-full max-w-full px-2 py-2 border rounded-lg text-sm ${
                      errors[`workingHours_${index}_end`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`workingHours_${index}_end`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`workingHours_${index}_end`]}
                    </p>
                  )}
                </div>
              </div>
              {errors[`workingHours_${index}_range`] && (
                <p className="text-red-500 text-xs mt-2">
                  {errors[`workingHours_${index}_range`]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Staff Member
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Staff"
                : "Add Staff"}
            </button>
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Error saving staff member
                </h3>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{formData.name}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
