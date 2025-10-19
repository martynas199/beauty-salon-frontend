import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ServicesAPI } from "./services.api";
import { setService, setBeautician } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import { SalonAPI } from "../salon/salon.api";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("All");
  const [salon, setSalon] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    ServicesAPI.list()
      .then(setServices)
      .finally(() => setLoading(false));
    SalonAPI.get()
      .then(setSalon)
      .catch(() => setSalon(null));
  }, []);

  // Format working hours for display
  const hoursDisplay = useMemo(() => {
    if (!salon?.hours) return "9AM–5PM, Mon–Fri";

    const hours = salon.hours;
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Find open days
    const openDays = days
      .map((day, idx) => ({ day, label: dayLabels[idx], hours: hours[day] }))
      .filter((d) => d.hours?.open);

    if (openDays.length === 0) return "Hours not set";

    // Get time range
    const times = openDays.map((d) => ({
      start: d.hours.start,
      end: d.hours.end,
    }));

    // Find min start and max end
    const earliestStart = times.reduce(
      (min, t) => (t.start < min ? t.start : min),
      times[0].start
    );
    const latestEnd = times.reduce(
      (max, t) => (t.end > max ? t.end : max),
      times[0].end
    );

    // Format time (remove leading zero and :00)
    const formatTime = (time) => {
      const [h, m] = time.split(":");
      const hour = parseInt(h);
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return m === "00" ? `${hour12}${period}` : `${hour12}:${m}${period}`;
    };

    // Format day range
    let dayRange;
    if (openDays.length === 7) {
      dayRange = "Every day";
    } else if (openDays.length === 1) {
      dayRange = openDays[0].label;
    } else {
      // Check if consecutive
      const firstIdx = days.indexOf(openDays[0].day);
      const lastIdx = days.indexOf(openDays[openDays.length - 1].day);
      const isConsecutive =
        openDays.length === lastIdx - firstIdx + 1 &&
        openDays.every((d, i) => days.indexOf(d.day) === firstIdx + i);

      if (isConsecutive) {
        dayRange = `${openDays[0].label}–${
          openDays[openDays.length - 1].label
        }`;
      } else {
        dayRange = openDays.map((d) => d.label).join(", ");
      }
    }

    return `${formatTime(earliestStart)}–${formatTime(latestEnd)}, ${dayRange}`;
  }, [salon]);

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set((services || []).map((s) => s.category).filter(Boolean))
    );
    return ["All", ...cats];
  }, [services]);

  const visible = useMemo(() => {
    if (activeCat === "All") return services;
    return services.filter((s) => s.category === activeCat);
  }, [services, activeCat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-8">
      {/* Hero Section - Full width on mobile */}
      <div
        className="relative rounded-b-3xl sm:rounded-3xl overflow-hidden h-[280px] md:h-[350px] bg-gray-900 mb-6 sm:mb-8 sm:mx-4 md:mx-6 lg:mx-8 sm:mt-8"
        style={{
          backgroundImage: `url(${
            salon?.heroUrl ||
            "https://images.unsplash.com/photo-1706629504952-ab5e50f5c179?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>

        {/* Hero Content */}
        <div className="relative h-full flex items-end p-5 sm:p-8 md:p-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {salon?.name || "Beauty Salon"}
            </h1>
            {salon?.about && (
              <p className="text-base md:text-lg text-white/95 mb-4 drop-shadow-md line-clamp-2">
                {salon.about}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-white/90">
              {salon?.address && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-medium">{salon.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                </svg>
                <span className="font-medium">{hoursDisplay}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Our Services
          </h2>
          <p className="text-gray-600">
            Discover our range of professional beauty treatments
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCat === cat
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((s) => (
            <ServiceCard
              key={s._id}
              service={s}
              onClick={() => {
                dispatch(
                  setService({
                    serviceId: s._id,
                    variantName: s.variants?.[0]?.name,
                    price: s.variants?.[0]?.price,
                  })
                );
                const bid =
                  s.beauticianId || (s.beauticianIds && s.beauticianIds[0]);
                if (bid)
                  dispatch(setBeautician({ beauticianId: bid, any: false }));
                navigate("/times");
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
