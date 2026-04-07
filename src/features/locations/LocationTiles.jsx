import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocationsAPI } from "./locations.api";
import { motion } from "framer-motion";

export default function LocationTiles() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    LocationsAPI.list()
      .then((data) => {
        // Only show active locations
        const activeLocations = data.filter((loc) => loc.active);
        setLocations(activeLocations);
      })
      .catch((err) => {
        console.error("Failed to load locations:", err);
        setLocations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || locations.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 sm:mb-10 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 tracking-wide">
          Our Locations
        </h2>
        <p className="text-gray-600 font-light text-base sm:text-lg max-w-2xl mx-auto">
          Visit us at any of our salon locations
        </p>
      </motion.div>

      {/* Location Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={location._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => navigate(`/beauticians?location=${location._id}`)}
          >
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
              {/* Location Image */}
              {location.image?.url && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={location.image.url}
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {location.name}
                    </h3>
                  </div>
                </div>
              )}

              {/* Location Details */}
              <div className="p-6">
                {!location.image?.url && (
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                    {location.name}
                  </h3>
                )}

                {location.description && (
                  <p className="text-gray-600 mb-4 text-sm">
                    {location.description}
                  </p>
                )}

                {/* Address */}
                {location.address && (
                  <div className="flex items-start gap-2 text-gray-700 mb-3">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0 text-brand-600"
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
                    <div className="text-sm">
                      {location.address.street && (
                        <div>{location.address.street}</div>
                      )}
                      <div>
                        {location.address.city}
                        {location.address.postcode &&
                          `, ${location.address.postcode}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  {location.contact?.phone && (
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <svg
                        className="w-5 h-5 text-brand-600"
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
                      <span>{location.contact.phone}</span>
                    </div>
                  )}
                  {location.contact?.email && (
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <svg
                        className="w-5 h-5 text-brand-600"
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
                      <span>{location.contact.email}</span>
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <div className="flex items-center gap-2 text-brand-700 font-medium group-hover:text-brand-800 transition-colors">
                  <span>Book at this location</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
