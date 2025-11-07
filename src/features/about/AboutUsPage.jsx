import { useState, useEffect } from "react";
import { api } from "../../lib/apiClient";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setLoading(true);
        const response = await api.get("/about-us");

        if (response.data.success) {
          setAboutUs(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching About Us content:", error);
        setError("Unable to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !aboutUs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Content Coming Soon
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {error ||
              "Our About Us page is being crafted with care. Please check back soon!"}
          </p>
        </div>
      </div>
    );
  }

  const paragraphs = aboutUs.description.split("\n\n").filter((p) => p.trim());

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image and Quote */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={aboutUs.image.url}
            alt="About Noble Elegance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          {/* Decorative Element */}
          <div className="mb-8">
            <svg
              className="w-16 h-16 mx-auto text-white/80"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 tracking-wide">
            About Us
          </h1>

          {/* Quote with elegant styling */}
          <blockquote className="text-xl md:text-2xl font-light italic leading-relaxed max-w-3xl mx-auto mb-8 text-white/95">
            "{aboutUs.quote}"
          </blockquote>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent w-16"></div>
              <svg
                className="w-8 h-8 text-brand-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent w-16"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4 tracking-wide">
              Our Story
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Every journey has a beginning, and ours started with a simple
              belief in the transformative power of beauty and self-care.
            </p>
          </div>

          {/* Story Content with Creative Layout */}
          <div className="space-y-12">
            {paragraphs.map((paragraph, index) => (
              <div
                key={index}
                className={`relative ${
                  index % 2 === 0 ? "lg:pr-24" : "lg:pl-24 lg:text-right"
                }`}
              >
                {/* Decorative Quote Mark */}
                <div
                  className={`absolute top-0 ${
                    index % 2 === 0
                      ? "-left-4 lg:-left-8"
                      : "-right-4 lg:-right-8 lg:text-right"
                  } text-6xl font-serif text-brand-200 select-none pointer-events-none`}
                >
                  "
                </div>

                {/* Paragraph Content */}
                <div className="relative z-10">
                  <p className="text-lg leading-relaxed text-gray-700 font-light">
                    {paragraph}
                  </p>

                  {/* Decorative Line */}
                  <div
                    className={`mt-6 ${
                      index % 2 === 0
                        ? "lg:mr-auto"
                        : "lg:ml-auto lg:text-right"
                    }`}
                  >
                    <div
                      className={`h-0.5 w-24 bg-gradient-to-r ${
                        index % 2 === 0
                          ? "from-brand-500 to-transparent"
                          : "from-transparent to-brand-500"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Side Decorative Element */}
                <div
                  className={`hidden lg:block absolute top-1/2 transform -translate-y-1/2 ${
                    index % 2 === 0 ? "right-0" : "left-0"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shadow-lg">
                    {index % 3 === 0 && (
                      <svg
                        className="w-8 h-8 text-brand-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    )}
                    {index % 3 === 1 && (
                      <svg
                        className="w-8 h-8 text-brand-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    {index % 3 === 2 && (
                      <svg
                        className="w-8 h-8 text-brand-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-brand-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6 tracking-wide">
              Our Values
            </h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              These principles guide everything we do, from the treatments we
              offer to the experience we create.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 border-2 border-brand-100 group-hover:border-brand-300">
                <svg
                  className="w-10 h-10 text-brand-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 16L3 5l5.5-.5L12 0l3.5 4.5L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1-.2L12 3.8l-3.1 4.6-2.1.2L7.7 14z" />
                  <path d="M12 8l1.5 3 3-.5-2.5 2.5.5 3L12 15l-2.5 1.5.5-3L7.5 10.5l3 .5L12 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We pursue perfection in every detail, from technique to service,
                ensuring each client receives exceptional care.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 border-2 border-brand-100 group-hover:border-brand-300">
                <svg
                  className="w-10 h-10 text-brand-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Compassion
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every client is treated with genuine care and understanding,
                creating a safe space for transformation.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 border-2 border-brand-100 group-hover:border-brand-300">
                <svg
                  className="w-10 h-10 text-brand-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Authenticity
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in enhancing natural beauty, not masking it,
                celebrating what makes each person unique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <svg
              className="w-16 h-16 mx-auto text-brand-500 mb-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6 tracking-wide">
            Experience Noble Elegance
          </h2>

          <p className="text-xl text-gray-600 font-light leading-relaxed mb-8 max-w-3xl mx-auto">
            Ready to discover your most radiant self? We're here to guide you on
            a journey of beauty, confidence, and self-discovery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/beauticians"
              className="inline-flex items-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-full hover:bg-brand-700 transition-colors duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Book Your Appointment
            </a>

            <a
              href="/salon"
              className="inline-flex items-center gap-3 border-2 border-brand-600 text-brand-600 px-8 py-4 rounded-full hover:bg-brand-600 hover:text-white transition-all duration-300 font-medium text-lg"
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Visit Our Salon
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
