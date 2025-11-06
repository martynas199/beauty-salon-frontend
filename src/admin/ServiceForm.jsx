import { useState, useEffect } from "react";
import { useImageUpload } from "../hooks/useImageUpload";
import FormField from "../components/forms/FormField";
import ConfirmDeleteModal from "../components/forms/ConfirmDeleteModal";
import Button from "../components/ui/Button";

/**
 * ServiceForm - Create or Edit a service
 *
 * @param {object} props
 * @param {object|null} props.service - Existing service for edit mode, null for create mode
 * @param {array} props.beauticians - List of beauticians for dropdown
 * @param {function} props.onSave - Callback(serviceData) when form is submitted
 * @param {function} props.onCancel - Callback when user cancels
 * @param {function} props.onDelete - Callback when user deletes (edit mode only)
 * @param {boolean} props.isSuperAdmin - Is user a super admin
 * @param {object} props.admin - Current admin user object
 */
export default function ServiceForm({
  service,
  beauticians,
  onSave,
  onCancel,
  onDelete,
  isSuperAdmin = false,
  admin,
}) {
  const isEditMode = Boolean(service);
  const { uploadImage, isUploading: isUploadingImage } = useImageUpload();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    primaryBeauticianId: "",
    additionalBeauticianIds: [],
    active: true,
    image: null,
    variants: [
      {
        name: "Standard",
        durationMin: 30,
        price: 0,
        bufferBeforeMin: 0,
        bufferAfterMin: 0,
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load existing service data in edit mode
  useEffect(() => {
    if (service) {
      // Helper to extract ID from populated object or string
      const extractId = (value) => {
        if (!value) return "";
        // If populated (object with _id), return _id, otherwise return the value itself
        return typeof value === "object" && value._id
          ? String(value._id)
          : String(value);
      };

      setFormData({
        name: service.name || "",
        category: service.category || "",
        description: service.description || "",
        primaryBeauticianId: extractId(service.primaryBeauticianId),
        additionalBeauticianIds: service.additionalBeauticianIds
          ? service.additionalBeauticianIds.map(extractId)
          : [],
        active: service.active !== undefined ? service.active : true,
        image: service.image || null,
        variants:
          service.variants && service.variants.length > 0
            ? service.variants
            : [
                {
                  name: "Standard",
                  durationMin: 30,
                  price: 0,
                  bufferBeforeMin: 0,
                  bufferAfterMin: 0,
                },
              ],
      });
    } else if (!isSuperAdmin && admin?.beauticianId) {
      // For non-super admins creating a new service, pre-select their beautician ID
      setFormData((prev) => ({
        ...prev,
        primaryBeauticianId: String(admin.beauticianId),
      }));
    }
  }, [service, isSuperAdmin, admin]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: "",
          durationMin: 30,
          price: 0,
          bufferBeforeMin: 0,
          bufferAfterMin: 0,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length === 1) {
      alert("At least one variant is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a service name";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Please enter a category";
    }

    if (!formData.primaryBeauticianId) {
      newErrors.primaryBeauticianId = "Please select a primary beautician";
    }

    if (formData.variants.length === 0) {
      newErrors.variants =
        "Please add at least one service variant with pricing";
    }

    formData.variants.forEach((v, i) => {
      if (!v.name.trim()) {
        newErrors[`variant_${i}_name`] = "Please enter a name for this variant";
      }
      if (!v.durationMin || v.durationMin <= 0) {
        newErrors[`variant_${i}_duration`] =
          "Duration must be at least 1 minute";
      }
      if (
        v.price === undefined ||
        v.price === null ||
        v.price === "" ||
        isNaN(v.price) ||
        v.price <= 0
      ) {
        newErrors[`variant_${i}_price`] =
          "Please enter a valid price greater than £0";
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
        {isEditMode ? "Edit Service" : "Create New Service"}
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
          <FormField
            label="Service Name"
            error={errors.name}
            required
            htmlFor="name"
          >
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              aria-invalid={!!errors.name}
            />
          </FormField>

          {/* Category */}
          <FormField
            label="Category"
            error={errors.category}
            required
            htmlFor="category"
          >
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Hair, Nails, Spa"
              aria-invalid={!!errors.category}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description" htmlFor="description">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </FormField>

          {/* Primary Beautician */}
          <FormField
            label="Primary Beautician"
            error={errors.primaryBeauticianId}
            required
            htmlFor="primaryBeauticianId"
          >
            <select
              id="primaryBeauticianId"
              value={formData.primaryBeauticianId}
              onChange={(e) =>
                handleChange("primaryBeauticianId", e.target.value)
              }
              disabled={!isSuperAdmin}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                errors.primaryBeauticianId
                  ? "border-red-500"
                  : "border-gray-300"
              } ${!isSuperAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
              aria-invalid={!!errors.primaryBeauticianId}
            >
              <option value="">Select a beautician</option>
              {beauticians.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {!isSuperAdmin && (
              <p className="text-sm text-gray-500 mt-1">
                You can only create services for yourself
              </p>
            )}
          </FormField>

          {/* Image Upload */}
          <FormField
            label="Service Image"
            error={errors.image}
            htmlFor="image"
            hint={isUploadingImage ? "Uploading..." : undefined}
          >
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image.url}
                  alt={formData.image.alt || "Service image"}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </FormField>

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
              Active (visible to customers)
            </label>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-lg font-semibold">Service Variants</h3>
              {errors.variants && (
                <p className="text-red-500 text-sm mt-1">{errors.variants}</p>
              )}
            </div>
            <Button
              type="button"
              onClick={addVariant}
              variant="brand"
              size="sm"
            >
              + Add Variant
            </Button>
          </div>

          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Variant {index + 1}</h4>
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Name"
                  error={errors[`variant_${index}_name`]}
                  required
                  htmlFor={`variant-${index}-name`}
                >
                  <input
                    type="text"
                    id={`variant-${index}-name`}
                    value={variant.name}
                    onChange={(e) =>
                      handleVariantChange(index, "name", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors[`variant_${index}_name`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., Standard"
                  />
                </FormField>

                <FormField
                  label="Duration (min)"
                  error={errors[`variant_${index}_duration`]}
                  required
                  htmlFor={`variant-${index}-duration`}
                >
                  <input
                    type="number"
                    id={`variant-${index}-duration`}
                    value={variant.durationMin}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "durationMin",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors[`variant_${index}_duration`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    min="1"
                  />
                </FormField>

                <FormField
                  label="Price (£)"
                  error={errors[`variant_${index}_price`]}
                  required
                  htmlFor={`variant-${index}-price`}
                >
                  <input
                    type="text"
                    id={`variant-${index}-price`}
                    inputMode="decimal"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors[`variant_${index}_price`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField
                  label="Buffer Before (min)"
                  htmlFor={`variant-${index}-buffer-before`}
                >
                  <input
                    type="number"
                    id={`variant-${index}-buffer-before`}
                    value={variant.bufferBeforeMin}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "bufferBeforeMin",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </FormField>

                <div className="col-span-2">
                  <FormField
                    label="Buffer After (min)"
                    htmlFor={`variant-${index}-buffer-after`}
                  >
                    <input
                      type="number"
                      id={`variant-${index}-buffer-after`}
                      value={variant.bufferAfterMin}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "bufferAfterMin",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          ))}

          {errors.variants && (
            <p className="text-red-500 text-sm">{errors.variants}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t gap-4">
          <div>
            {isEditMode && (
              <Button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                variant="danger"
                className="w-full sm:w-auto"
              >
                Delete Service
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              loading={isSubmitting}
              variant="brand"
              className="w-full sm:w-auto"
            >
              {isEditMode ? "Update Service" : "Create Service"}
            </Button>
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
                  Error saving service
                </h3>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        itemName={formData.name}
        itemType="service"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
