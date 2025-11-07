import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/apiClient";
import { useDispatch } from "react-redux";
import { setService, setBeautician } from "../booking/bookingSlice";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../components/ui/PageTransition";
import Card from "../../components/ui/Card";
import ServiceCard from "../landing/ServiceCard";
import ServiceVariantSelector from "../../components/ServiceVariantSelector";

export default function BeauticianSelectionPage() {
  const [beauticians, setBeauticians] = useState([]);
  const [selectedBeautician, setSelectedBeautician] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Fetch all beauticians
    api
      .get("/beauticians")
      .then((res) => {
        const activeBeauticians = res.data.filter((b) => b.active);
        setBeauticians(activeBeauticians);

        // Check if there's a selected beautician in URL params
        const selectedId = searchParams.get("selected");
        if (selectedId) {
          const beautician = activeBeauticians.find(
            (b) => b._id === selectedId
          );
          if (beautician) {
            handleBeauticianSelect(beautician);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch beauticians:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleBeauticianSelect = async (beautician) => {
    setSelectedBeautician(beautician);
    setServicesLoading(true);

    try {
      // Fetch services offered by this beautician
      const res = await api.get("/services");
      const beauticianServices = res.data.filter((service) => {
        // Helper to get ID from either string or object
        const getId = (field) => {
          if (!field) return null;
          return typeof field === "object" && field._id ? field._id : field;
        };

        // Check primary beautician (can be populated object or ID string)
        const primaryId = getId(service.primaryBeauticianId);
        if (primaryId === beautician._id) return true;

        // Check legacy single beautician field
        const legacyId = getId(service.beauticianId);
        if (legacyId === beautician._id) return true;

        // Check additional beauticians array
        if (
          service.additionalBeauticianIds &&
          Array.isArray(service.additionalBeauticianIds)
        ) {
          const hasMatch = service.additionalBeauticianIds.some(
            (id) => getId(id) === beautician._id
          );
          if (hasMatch) return true;
        }

        // Check legacy beauticians array
        if (service.beauticianIds && Array.isArray(service.beauticianIds)) {
          const hasMatch = service.beauticianIds.some(
            (id) => getId(id) === beautician._id
          );
          if (hasMatch) return true;
        }

        return false;
      });

      console.log("Beautician selected:", beautician.name, beautician._id);
      console.log("Total services fetched:", res.data.length);
      console.log(
        "Filtered services for this beautician:",
        beauticianServices.length
      );
      console.log("Services:", beauticianServices);

      setServices(beauticianServices);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    // Check if service has variants that need selection
    if (service.variants && service.variants.length > 1) {
      setSelectedService(service);
      setShowVariantSelector(true);
    } else {
      // Auto-select single variant or use service defaults
      const variant = service.variants?.[0] || {
        name: "Standard Service",
        price: service.price,
        durationMin: service.durationMin,
        bufferBeforeMin: 0,
        bufferAfterMin: 10,
      };

      handleVariantConfirm(variant, service);
    }
  };

  const handleVariantConfirm = (selectedVariant, service) => {
    // Set booking data with selected variant
    dispatch(
      setService({
        serviceId: service._id,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        durationMin: selectedVariant.durationMin,
        bufferBeforeMin: selectedVariant.bufferBeforeMin,
        bufferAfterMin: selectedVariant.bufferAfterMin,
      })
    );
    dispatch(
      setBeautician({
        beauticianId: selectedBeautician._id,
        any: false,
      })
    );

    // Navigate to time selection
    navigate("/times");
  };

  const handleVariantCancel = () => {
    setShowVariantSelector(false);
    setSelectedService(null);
  };

  const handleBack = () => {
    setSelectedBeautician(null);
    setServices([]);
    setShowVariantSelector(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedBeautician ? (
          // Step 1: Select a Beautician
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-wide">
                Select a Beautician
              </h1>
              <p className="text-gray-600 font-light">
                Choose your preferred beauty professional
              </p>
            </div>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beauticians.map((beautician) => (
                <StaggerItem key={beautician._id}>
                  <Card
                    hoverable
                    className="cursor-pointer overflow-hidden p-0 h-96"
                    onClick={() => handleBeauticianSelect(beautician)}
                  >
                    {/* Full Card Image with Name Overlay */}
                    <div className="relative h-full w-full bg-gray-200">
                      {beautician.image?.url ? (
                        <img
                          src={beautician.image.url}
                          alt={beautician.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-20 h-20"
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
                        </div>
                      )}
                      {/* Strong gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                      {/* Name at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-semibold text-white mb-1">
                          {beautician.name}
                        </h3>
                        {beautician.specialties &&
                          beautician.specialties.length > 0 && (
                            <p className="text-white/90 text-sm">
                              {beautician.specialties.slice(0, 2).join(" • ")}
                            </p>
                          )}
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        ) : (
          // Step 2: Select a Service
          <>
            <div className="mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Beauticians
              </button>

              <div className="flex items-center gap-4 mb-4">
                {/* Selected Beautician Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  {selectedBeautician.image?.url ? (
                    <img
                      src={selectedBeautician.image.url}
                      alt={selectedBeautician.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-8 h-8"
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
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">
                    Services by {selectedBeautician.name}
                  </h1>
                  <p className="text-gray-600 font-light">
                    Choose a service to book
                  </p>
                </div>
              </div>
            </div>

            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No services available for this beautician.
                </p>
              </div>
            ) : (
              <StaggerContainer className="grid gap-6 sm:grid-cols-2">
                {services.map((service) => (
                  <StaggerItem key={service._id}>
                    <ServiceCard
                      service={service}
                      onClick={() => handleServiceSelect(service)}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </>
        )}
      </div>

      {/* Service Variant Selection Modal */}
      {showVariantSelector && selectedService && (
        <ServiceVariantSelector
          service={selectedService}
          selectedBeautician={selectedBeautician}
          onVariantSelect={handleVariantConfirm}
          onCancel={handleVariantCancel}
        />
      )}
    </PageTransition>
  );
}
