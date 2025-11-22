import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useDispatch } from "react-redux";
import { ServicesAPI } from "./services.api";
import { setService, setBeautician } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import { SalonAPI } from "../salon/salon.api";
import HeroSectionDisplay from "../heroSections/HeroSectionDisplay";
import PopularCollections from "../products/PopularCollections";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../components/ui/PageTransition";
import { ServiceCardSkeleton } from "../../components/ui/Skeleton";
import { api } from "../../lib/apiClient";
import Card from "../../components/ui/Card";
import { motion, useScroll, useTransform } from "framer-motion";
import logo from "../../assets/logo.svg";
import ScrollRevealText from "../../components/ui/ScrollRevealText";
import ShopByBrand from "./ShopByBrand";
import SEOHead from "../../components/seo/SEOHead";
import {
  generateLocalBusinessSchema,
  generateWebSiteSchema,
} from "../../utils/schemaGenerator";

// Lazy load ProductCarousel (Swiper carousel - ~12KB)
const ProductCarousel = lazy(() => import("../products/ProductCarousel"));

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("All");
  const [salon, setSalon] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Parallelize all API calls for faster loading
    Promise.all([
      ServicesAPI.list(),
      SalonAPI.get().catch(() => null),
      api
        .get("/beauticians")
        .then((res) => res.data.filter((b) => b.active))
        .catch(() => []),
    ])
      .then(([servicesData, salonData, beauticiansData]) => {
        setServices(servicesData);
        setSalon(salonData);
        setBeauticians(beauticiansData);
      })
      .catch((err) => console.error("Failed to fetch landing page data:", err))
      .finally(() => setLoading(false));
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

  // Generate combined schema for homepage
  const homepageSchema = useMemo(() => {
    const schemas = [generateLocalBusinessSchema(), generateWebSiteSchema()];

    return {
      "@context": "https://schema.org",
      "@graph": schemas,
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -20]);

  if (loading) {
    return (
      <div className="-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Skeleton for services */}
          <div className="mb-6 sm:mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse mb-2"></div>
            <div className="h-4 w-72 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Noble Elegance Beauty Salon Wisbech | Aesthetic Clinic Cambridgeshire"
        description="Premier beauty salon in Wisbech offering lip fillers, anti-wrinkle injections, dermal fillers, permanent makeup, laser treatments & hair services. Book now!"
        keywords="aesthetic clinic Wisbech, lip fillers Wisbech, anti wrinkle injections Cambridgeshire, dermal fillers Wisbech, skin boosters Wisbech, laser tattoo removal Wisbech, laser teeth whitening Wisbech, facial treatments Wisbech, brow lamination March, hair extensions Wisbech, permanent makeup lips, cheek augmentation, chin fillers, nasolabial folds treatment, waxing services Wisbech, beauty salon King's Lynn"
        schema={homepageSchema}
      />

      {/* Fixed Background Logo with Parallax Effect - Behind all content */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{
          y,
          zIndex: -1,
        }}
      >
        <img
          src={logo}
          alt="Noble Elegance Beauty Salon Logo"
          className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-40"
        />
      </motion.div>

      <PageTransition className="-mt-8 relative z-0 overflow-x-hidden">
        {/* Hero Section Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12 overflow-x-hidden">
          <HeroSectionDisplay />

          {/* Main H1 Heading - SEO Critical */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 text-center mt-12 mb-4 tracking-wide">
            Premier Aesthetic & Beauty Salon in Wisbech
          </h1>
          <p className="text-center text-gray-600 text-lg max-w-4xl mx-auto mb-8 font-light">
            Expert cosmetic treatments including{" "}
            <a
              href="/beauticians"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              Hair extensions
            </a>
            ,{" "}
            <a
              href="/beauticians"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              anti-wrinkle injections
            </a>
            ,{" "}
            <a
              href="/beauticians"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              dermal fillers
            </a>
            ,{" "}
            <a
              href="/beauticians"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              permanent makeup
            </a>
            , and{" "}
            <a
              href="/beauticians"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              laser treatments
            </a>
            . Located in <strong>Wisbech, Cambridgeshire</strong>, serving
            March, King's Lynn, and Peterborough.
          </p>
        </div>

        {/* Scroll Reveal Text Quote - Opening */}
        <ScrollRevealText
          text={`"Invest in your skin.\nIt's going to represent you for a very long time."`}
          caption=""
          revealColor="#d4a710"
          captionColor="text-brand-700"
        />

        {/* Popular Collections Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 overflow-x-hidden">
          <PopularCollections />
        </div>

        {/* Scroll Reveal Text Quote */}
        {/* <ScrollRevealText
          text={`"The space becomes architecture when\nit provokes emotion."`}
          caption="Beatriz Galán"
          className="bg-gradient-to-b from-white via-brand-50 to-white"
          revealColor="#b8910e"
          captionColor="text-brand-800"
        /> */}

        {/* Beauticians Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 overflow-x-hidden">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2 tracking-wide">
              Our Expert Beauticians
            </h2>
            <p className="text-gray-600 font-light">
              Choose your preferred beauty professional for personalized
              treatments in Cambridgeshire
            </p>
          </div>
          {/* Beauticians Grid with scroll-in and parallax animations */}
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.4,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden"
          >
            {beauticians.map((beautician) => (
              <motion.div
                key={beautician._id}
                variants={{
                  hidden: { opacity: 0, y: 80 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 1.8,
                      ease: "easeOut",
                    },
                  },
                }}
                whileHover={{
                  scale: 1.03,
                  y: -4,
                  transition: { duration: 0.3 },
                }}
              >
                <Card
                  hoverable
                  className="cursor-pointer overflow-hidden p-0 h-96"
                  onClick={() =>
                    navigate(`/beauticians?selected=${beautician._id}`)
                  }
                >
                  {/* Full Card Image with Name Overlay */}
                  <div className="relative h-full w-full bg-gray-200">
                    {beautician.image?.url ? (
                      <img
                        src={beautician.image.url}
                        alt={`${beautician.name} - Professional Beautician at Noble Elegance Beauty Salon Huntingdon`}
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
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Reveal Text Quote 2 */}
        <ScrollRevealText
          text={`"Beauty begins the moment\nyou decide to be yourself."`}
          caption="Coco Chanel"
          revealColor="#d4a710"
          captionColor="text-brand-700"
        />

        {/* Product Carousel */}
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-6 py-16 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <ProductCarousel />
        </Suspense>
        {/* Shop by Brand Section */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 md:pt-16 lg:pt-20 mb-16 overflow-x-hidden">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-10 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 tracking-wide">
              Shop by Brand
            </h2>
            <p className="text-gray-600 font-light text-base sm:text-lg max-w-2xl mx-auto">
              Explore our curated selection from the world's finest beauty
              brands
            </p>
          </motion.div>

          {/* Brand Cards Grid */}
          <ShopByBrand />
        </div>
      </PageTransition>
    </>
  );
}
