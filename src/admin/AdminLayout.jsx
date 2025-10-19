import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { api } from "../lib/apiClient";

const items = [
  { to: "/", label: "Back to Home", icon: "🏠", external: true },
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/appointments", label: "Appointments", icon: "📅" },
  { to: "/admin/revenue", label: "Revenue Analytics", icon: "💰" },
  { to: "/admin/services", label: "Services", icon: "💅" },
  { to: "/admin/staff", label: "Staff", icon: "👥" },
  { to: "/admin/hours", label: "Working Hours", icon: "🕐" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salonName, setSalonName] = useState("Beauty Salon");

  useEffect(() => {
    api
      .get("/salon")
      .then((r) => {
        if (r.data?.name) {
          setSalonName(r.data.name);
        }
      })
      .catch(() => {
        // Keep default name if fetch fails
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <div>
            <div className="font-bold text-lg">{salonName}</div>
            <div className="text-xs text-brand-100">Admin Portal</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen bg-white shadow-xl lg:shadow-none border-r border-gray-200 z-40
            transform transition-transform duration-300 ease-in-out
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
            w-72 lg:w-auto
          `}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="hidden lg:block p-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">✨</span>
                <div>
                  <h1 className="font-bold text-xl">{salonName}</h1>
                  <p className="text-sm text-brand-100">Admin Portal</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {items.map((it) => {
                const isActive = !it.external && pathname === it.to;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                      transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 transform scale-[1.02]"
                          : it.external
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400"
                          : "hover:bg-gray-100 text-gray-700 hover:scale-[1.01] hover:shadow-sm"
                      }
                    `}
                  >
                    <span
                      className={`text-xl transition-transform group-hover:scale-110 ${
                        isActive ? "" : "grayscale"
                      }`}
                    >
                      {it.icon}
                    </span>
                    <span>{it.label}</span>
                    {isActive && (
                      <span className="ml-auto">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                  AD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Admin User
                  </div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="p-4 lg:p-6 min-h-screen">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
