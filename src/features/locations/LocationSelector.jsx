import { useState, useEffect } from "react";
import { LocationsAPI } from "./locations.api";
import { api } from "../../lib/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LocationSelector Modal
 * Shows after service selection to let user pick a location
 */
export default function LocationSelector({
  isOpen,
  onSelect,
  onCancel,
  beauticianId,
}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen, beauticianId]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await LocationsAPI.list();

      // If beautician specified, filter to only their locations
      if (beauticianId) {
        // Fetch beautician to check their locationIds
        const beauticianRes = await api.get(`/beauticians/${beauticianId}`);
        const beautician = beauticianRes.data;

        if (beautician.locationIds && beautician.locationIds.length > 0) {
          const filtered = data.filter((loc) =>
            beautician.locationIds.includes(loc._id),
          );
          setLocations(filtered);

          // If only one location, auto-select it
          if (filtered.length === 1) {
            onSelect(filtered[0]);
            return;
          }
        } else {
          // Beautician has no locations assigned - show empty
          setLocations([]);
        }
      } else {
        setLocations(data);

        // If only one location, auto-select it
        if (data.length === 1) {
          onSelect(data[0]);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              {!loading && locations.length === 0
                ? "Location Required"
                : "Select Location"}
            </h2>
            <p className="text-gray-600">
              {!loading && locations.length === 0
                ? "This beautician needs a location assignment"
                : "Choose where you'd like your appointment"}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12 px-6">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-xl font-semibold mb-3 text-gray-900">
                  This beautician does not have a location assigned
                </p>
                <p className="text-gray-600 mb-6">
                  Please contact us to book your appointment with this
                  beautician
                </p>
                <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Get in touch:
                  </p>
                  <p className="text-sm text-gray-600">
                    Call us or send an email to schedule your service
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {locations.map((location) => (
                  <motion.div
                    key={location._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      hoverable
                      className={`cursor-pointer transition-all ${
                        selectedLocation?._id === location._id
                          ? "ring-2 ring-brand-600 shadow-lg"
                          : ""
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      {/* Location Image */}
                      {location.image?.url && (
                        <div className="h-32 overflow-hidden rounded-t-lg">
                          <img
                            src={location.image.url}
                            alt={location.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        {/* Location Name */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          {selectedLocation?._id === location._id && (
                            <svg
                              className="w-5 h-5 text-brand-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {location.name}
                        </h3>

                        {/* Address */}
                        <div className="text-sm text-gray-600 mb-3">
                          <p>{location.address.street}</p>
                          <p>
                            {location.address.city}, {location.address.postcode}
                          </p>
                        </div>

                        {/* Contact */}
                        {location.contact?.phone && (
                          <p className="text-xs text-gray-500">
                            📞 {location.contact.phone}
                          </p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="min-w-[120px]"
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
