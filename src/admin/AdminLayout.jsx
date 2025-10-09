import { Link, Outlet, useLocation } from "react-router-dom";
const items = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/hours", label: "Working Hours" },
  { to: "/admin/timeoff", label: "Time Off" },
  { to: "/admin/settings", label: "Settings" },
];
export default function AdminLayout(){
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4">
        <div className="font-semibold mb-4">Salon Admin</div>
        <nav className="space-y-1">
          {items.map(it => (
            <Link key={it.to} to={it.to}
              className={`block rounded px-3 py-2 text-sm ${pathname===it.to ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>
              {it.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="p-6"><Outlet /></section>
    </div>
  );
}
