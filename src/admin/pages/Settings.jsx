import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";
import Button from "../../components/ui/Button";

export default function Settings() {
  const [formData, setFormData] = useState({
    salonName: "",
    salonDescription: "",
    salonAddress: "",
    salonPhone: "",
    salonEmail: "",
    heroImage: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/settings");
      const settings = response.data;
      setFormData({
        salonName: settings.salonName || "",
        salonDescription: settings.salonDescription || "",
        salonAddress: settings.salonAddress || "",
        salonPhone: settings.salonPhone || "",
        salonEmail: settings.salonEmail || "",
        heroImage: settings.heroImage || null,
      });
      if (settings.heroImage?.url) {
        setImagePreview(settings.heroImage.url);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load salon settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Upload image if a new one was selected
      let heroImageData = formData.heroImage;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const imageResponse = await api.post(
          "/settings/upload-hero",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        heroImageData = imageResponse.data.heroImage;
      }

      // 2. Update settings
      await api.patch("/settings", {
        salonName: formData.salonName,
        salonDescription: formData.salonDescription,
        salonAddress: formData.salonAddress,
        salonPhone: formData.salonPhone,
        salonEmail: formData.salonEmail,
        heroImage: heroImageData,
      });

      setMessage({
        type: "success",
        text: "Salon settings saved successfully!",
      });

      // Reload settings to get the updated data
      await loadSettings();
      setImageFile(null);

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide mb-2">
          Salon Settings
        </h1>
        <p className="text-gray-600 font-light leading-relaxed">
          Manage your salon's public information, description, and hero image.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Salon Information Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>ℹ️</span>
              <span>Salon Information</span>
            </h2>

            <div className="space-y-4">
              {/* Salon Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salon Name
                </label>
                <input
                  type="text"
                  value={formData.salonName}
                  onChange={(e) => handleChange("salonName", e.target.value)}
                  placeholder="e.g., Noble Elegance Beauty Salon"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.salonDescription}
                  onChange={(e) =>
                    handleChange("salonDescription", e.target.value)
                  }
                  placeholder="e.g., Specialising in Hair Extensions, Cellulite Treatments, Brow & Lash - luxury beauty rituals."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This description appears on the booking page and salon details
                  page.
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.salonAddress}
                  onChange={(e) => handleChange("salonAddress", e.target.value)}
                  placeholder="e.g., 123 Main Street, London, SW1A 1AA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.salonPhone}
                    onChange={(e) => handleChange("salonPhone", e.target.value)}
                    placeholder="e.g., +44 20 1234 5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.salonEmail}
                    onChange={(e) => handleChange("salonEmail", e.target.value)}
                    placeholder="e.g., info@salon.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🖼️</span>
              <span>Hero Image</span>
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a banner image for your salon. This appears at the top of
                the booking page. Recommended size: 1200x400px
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Hero preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Upload Button */}
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {imageFile
                      ? "Change Image"
                      : imagePreview
                      ? "Replace Image"
                      : "Upload Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ New image selected: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button onClick={loadSettings} variant="outline" disabled={saving}>
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              loading={saving}
              variant="brand"
            >
              💾 Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
