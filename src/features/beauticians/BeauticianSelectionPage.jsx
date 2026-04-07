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
import LocationSelector from "../locations/LocationSelector";
import SEOHead from "../../components/seo/SEOHead";
import { generateBreadcrumbSchema } from "../../utils/schemaGenerator";

export default function BeauticianSelectionPage() {
  const [beauticians, setBeauticians] = useState([]);
  const [selectedBeautician, setSelectedBeautician] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [pendingServiceData, setPendingServiceData] = useState(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [locations, setLocations] = useState([]);
  const [multiLocationEnabled, setMultiLocationEnabled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch beauticians, locations, and salon feature flags
        const [beauticiansRes, locationsRes, salonRes] = await Promise.all([
          api.get("/beauticians"),
          api.get("/locations"),
          api.get("/salon").catch(() => ({ data: { multiLocationEnabled: false } })),
        ]);

        let activeBeauticians = beauticiansRes.data.filter((b) => b.active);

        setBeauticians(activeBeauticians);
        setLocations(locationsRes.data || []);
        setMultiLocationEnabled(!!salonRes?.data?.multiLocationEnabled);

        // Check if there's a selected beautician in URL params
        const selectedId = searchParams.get("selected");
        if (selectedId) {
          const beautician = activeBeauticians.find(
            (b) => b._id === selectedId,
          );
          if (beautician) {
            handleBeauticianSelect(beautician);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleBeauticianSelect = async (beautician) => {
    // Fetch the full beautician data to ensure we have the latest inSalonPayment flag
    let fullBeauticianData = beautician;
    try {
      const beauticianRes = await api.get(`/beauticians/${beautician._id}`);
      fullBeauticianData = beauticianRes.data;
    } catch (err) {
      console.error("Failed to fetch full beautician data:", err);
    }

    setSelectedBeautician(fullBeauticianData);
    setServicesLoading(true);

    // Update URL to include selected beautician
    navigate(`/beauticians?selected=${beautician._id}`, { replace: true });

    try {
      // Fetch services offered by this beautician
      const res = await api.get("/services", {
        params: { limit: 1000 }, // Fetch all services
      });
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
            (id) => getId(id) === beautician._id,
          );
          if (hasMatch) return true;
        }

        // Check legacy beauticians array
        if (service.beauticianIds && Array.isArray(service.beauticianIds)) {
          const hasMatch = service.beauticianIds.some(
            (id) => getId(id) === beautician._id,
          );
          if (hasMatch) return true;
        }

        return false;
      });

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
    // Calculate final price (use promo price if available, otherwise regular price)
    const finalPrice = selectedVariant.promoPrice || selectedVariant.price;

    const serviceData = {
      serviceId: service._id,
      variantName: selectedVariant.name,
      price: finalPrice,
      durationMin: selectedVariant.durationMin,
      bufferBeforeMin: selectedVariant.bufferBeforeMin,
      bufferAfterMin: selectedVariant.bufferAfterMin,
    };

    setShowVariantSelector(false);
    if (!multiLocationEnabled) {
      dispatch(setService(serviceData));
      dispatch(
        setBeautician({
          beauticianId: selectedBeautician._id,
          any: false,
          inSalonPayment: selectedBeautician.inSalonPayment || false,
          locationId: undefined,
        }),
      );
      navigate("/times");
      return;
    }

    // Multi-location flow: ask user to choose location
    setPendingServiceData(serviceData);
    setShowLocationSelector(true);
  };

  const handleLocationSelect = (location) => {
    console.log("🎯 [BeauticianSelection] Location selected:", location);
    setShowLocationSelector(false);
    setPendingServiceData(null);

    // Set service data
    if (pendingServiceData) {
      dispatch(setService(pendingServiceData));
    }

    const beauticianData = {
      beauticianId: selectedBeautician._id,
      any: false,
      inSalonPayment: selectedBeautician.inSalonPayment || false,
      locationId: location._id,
    };

    console.log(
      "🎯 [BeauticianSelection] Dispatching setBeautician with data:",
      beauticianData,
    );

    // Set beautician with location
    dispatch(setBeautician(beauticianData));

    // Navigate to time selection
    navigate("/times");
  };

  const handleLocationCancel = () => {
    setShowLocationSelector(false);
    setPendingServiceData(null);
  };

  const handleVariantCancel = () => {
    setShowVariantSelector(false);
    setSelectedService(null);
  };

  const handleBack = () => {
    setSelectedBeautician(null);
    setServices([]);
    setShowVariantSelector(false);
    setShowLocationSelector(false);
    setPendingServiceData(null);
    setSelectedService(null);
    setIsBioExpanded(false);
    // Clear the URL parameter when going back
    navigate("/beauticians", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Book Appointment", url: "/beauticians" },
  ]);

  return (
    <PageTransition className="min-h-screen py-8 overflow-x-hidden">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Book Appointment Wisbech | Expert Beauticians - Noble Elegance"
        description="Book your beauty appointment in Wisbech. Expert beauticians specializing in permanent makeup, brows, lashes & treatments. Online booking available 24/7!"
        keywords="book beauty appointment Wisbech, beauty booking Cambridgeshire, permanent makeup appointment, book beautician Wisbech, beauty salon booking March, online booking beauty salon, King's Lynn beauty appointments"
        schema={breadcrumbSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {!selectedBeautician ? (
          // Step 1: Select a Beautician
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-wide">
                Choose a beautician
              </h1>
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
                          alt={`${
                            beautician.name
                          } - Expert Beautician in Huntingdon specializing in ${
                            beautician.specialties?.slice(0, 2).join(", ") ||
                            "beauty treatments"
                          }`}
                          className="w-full h-full object-cover"
                          loading="lazy"
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

                      {/* Location badges at top */}
                      {beautician.locationIds &&
                        beautician.locationIds.length > 0 && (
                          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
                            {beautician.locationIds.slice(0, 3).map((locId) => {
                              const location = locations.find(
                                (l) => l._id === locId,
                              );
                              return location ? (
                                <span
                                  key={locId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full"
                                >
                                  <svg
                                    className="w-3 h-3"
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
                                  {location.name}
                                </span>
                              ) : null;
                            })}
                            {beautician.locationIds.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
                                +{beautician.locationIds.length - 3}
                              </span>
                            )}
                          </div>
                        )}

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
                  {selectedBeautician.bio && (
                    <div>
                      <p
                        className={`text-sm text-gray-700 max-w-lg mb-0 ${
                          isBioExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {selectedBeautician.bio}
                      </p>
                      {!isBioExpanded &&
                        selectedBeautician.bio.length > 100 && (
                          <button
                            onClick={() => setIsBioExpanded(true)}
                            className="flex items-center text-amber-700 hover:text-amber-800 transition-colors text-xs font-medium"
                          >
                            <span>Read more</span>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        )}
                      {isBioExpanded && selectedBeautician.bio.length > 100 && (
                        <button
                          onClick={() => setIsBioExpanded(false)}
                          className="flex items-center gap-1 text-amber-700 hover:text-amber-800 transition-colors mt-1 text-xs font-medium"
                        >
                          <span>Show less</span>
                          <svg
                            className="w-3 h-3 rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-gray-600 font-light mt-2">
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
                <div className="max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-brand-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-600">
                    This beautician is preparing their service menu. In the
                    meantime, feel free to explore our other talented
                    professionals!
                  </p>
                </div>
              </div>
            ) : (
              <StaggerContainer className="grid gap-6 sm:grid-cols-2 overflow-x-hidden w-full">
                {services.map((service) => (
                  <StaggerItem
                    key={service._id}
                    className="w-full overflow-x-hidden"
                  >
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

      {/* Location Selection Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onSelect={handleLocationSelect}
        onCancel={handleLocationCancel}
        beauticianId={selectedBeautician?._id}
      />
    </PageTransition>
  );
}
