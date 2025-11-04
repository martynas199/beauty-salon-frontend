import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../lib/apiClient";
import { selectAdmin, clearAuth } from "../features/auth/authSlice";
import logo from "../assets/logo.svg";

const items = [
  { to: "/", label: "Back to Home", icon: "🏠", external: true },
  { divider: "Core" },
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/appointments", label: "Appointments", icon: "📅" },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/revenue", label: "Revenue Analytics", icon: "💰" },
  { divider: "Booking Setup" },
  { to: "/admin/services", label: "Services", icon: "💅" },
  { to: "/admin/staff", label: "Staff", icon: "👥" },
  { to: "/admin/hours", label: "Working Hours", icon: "🕐" },
  { to: "/admin/timeoff", label: "Time Off", icon: "🏖️" },
  { divider: "Website Content" },
  { to: "/admin/hero-sections", label: "Hero Sections", icon: "✨" },
  { to: "/admin/products", label: "Products", icon: "🛍️" },
  { to: "/admin/cancellation", label: "Cancellation Policy", icon: "�" },
  { divider: "Configuration" },
  { to: "/admin/settings", label: "Salon Settings", icon: "⚙️" },
  { to: "/admin/stripe-connect", label: "Stripe Connect", icon: "�" },
  { to: "/admin/admin-links", label: "Admin Links", icon: "�" },
  { to: "/admin/profile", label: "My Profile", icon: "👤" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);
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

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state and redirect
      dispatch(clearAuth());
      navigate("/admin/login");
    }
  };

  // Get admin initials for avatar
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
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
            <div className="hidden lg:block p-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h1 className="font-bold text-lg">{salonName}</h1>
                  <p className="text-xs text-brand-100">Admin Portal</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {items.map((it, idx) => {
                // Render divider
                if (it.divider) {
                  return (
                    <div key={`divider-${idx}`} className="pt-3 pb-1.5 px-2">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {it.divider}
                      </div>
                    </div>
                  );
                }

                const isActive = !it.external && pathname === it.to;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
                      transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20"
                          : it.external
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 hover:border-gray-400"
                          : "hover:bg-gray-100 text-gray-700 hover:shadow-sm"
                      }
                    `}
                  >
                    <span
                      className={`text-lg transition-transform group-hover:scale-110 ${
                        isActive ? "" : "grayscale"
                      }`}
                    >
                      {it.icon}
                    </span>
                    <span className="text-sm">{it.label}</span>
                    {isActive && (
                      <span className="ml-auto">
                        <svg
                          className="w-4 h-4"
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
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                  {getInitials(admin?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {admin?.name || "Admin User"}
                  </div>
                  <div className="text-[10px] text-gray-500 capitalize">
                    {admin?.role || "Administrator"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
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
