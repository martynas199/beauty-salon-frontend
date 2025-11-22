import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-5">
            <Link
              to="/"
              className="inline-block mb-6 transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src={logo}
                alt="Noble Elegance Beauty Salon Logo"
                className="h-16 sm:h-20 w-auto drop-shadow-lg"
              />
            </Link>
            <p className="text-base leading-relaxed mb-8 text-gray-300">
              ✨ Your destination for{" "}
              <span className="text-brand-400 font-semibold">
                luxury beauty treatments
              </span>{" "}
              and
              <span className="text-brand-400 font-semibold">
                {" "}
                aesthetic excellence
              </span>{" "}
              in the heart of Cambridgeshire.
            </p>

            {/* Call to Action Button */}
            <Link
              to="/beauticians"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Book Appointment
            </Link>
          </div>

          {/* Contact Info Card */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-brand-400/50 transition-colors duration-300">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-brand-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Visit Us
            </h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-white text-lg mb-1">
                  Noble Elegance Beauty Salon
                </div>
                <div className="text-gray-400">12 Blackfriars Rd</div>
                <div className="text-gray-400">Wisbech, PE13 1AT</div>
                <div className="text-gray-400">Cambridgeshire, UK</div>
              </div>

              <a
                href="tel:+447928775746"
                className="flex items-center gap-3 text-brand-400 hover:text-brand-300 transition-colors group"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="font-medium">+44 7928 775746</span>
              </a>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-white font-medium mb-1">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Open 7 Days
                </div>
                <div className="text-sm text-gray-400">
                  Mon - Sun: 9:00 AM - 5:00 PM
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=12+Blackfriars+Rd+Wisbech+PE13+1AT"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors group"
              >
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                Get Directions →
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-brand-400 to-purple-500 rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/beauticians"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Shop Products
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/salon"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://g.page/r/CWuKVGq1Zpp1EBI/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Leave a Review ⭐
                </a>
              </li>
            </ul>
          </div>

          {/* Services & Info */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-brand-500 rounded-full"></div>
              Info
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/faq"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-brand-400 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  My Account
                </Link>
              </li>
            </ul>

            {/* Social Media - Add when available */}
            {/* <div className="mt-6">
              <h4 className="text-white font-medium text-sm mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:text-brand-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400 text-center md:text-left">
              <p>
                &copy; {currentYear}{" "}
                <span className="text-white font-medium">
                  Noble Elegance Beauty Salon
                </span>
                . All rights reserved.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Crafted with care in Cambridgeshire
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                <span>Licensed Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
