import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  LayoutDashboard, Users, ShieldCheck, FileText,
  Film, LogOut, ChevronLeft, ScanLine,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/kyc", icon: ScanLine, label: "KYC Review" },
  { to: "/admin/clearances", icon: ShieldCheck, label: "Clearances" },
  { to: "/admin/posts", icon: FileText, label: "Posts" },
  { to: "/admin/reels", icon: Film, label: "Reels" },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-base-200">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-60 bg-base-100 border-r border-base-300 flex flex-col flex-shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-4 border-b border-base-300">
          <h1 className="text-lg font-extrabold tracking-tight">
            <span className="text-primary">Ga</span>Link
            <span className="text-xs font-normal text-base-content/40 ml-2">Admin</span>
          </h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-base-300 space-y-1">
          <NavLink
            to="/feed"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors"
          >
            <ChevronLeft size={18} />
            Back to App
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error/70 hover:bg-error/10 hover:text-error transition-colors w-full text-left"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
