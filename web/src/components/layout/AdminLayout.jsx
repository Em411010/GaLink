import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  LayoutDashboard, Users, ShieldCheck, FileText,
  Film, LogOut, ChevronLeft, ScanLine, Menu, X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <h1 className="text-lg font-extrabold tracking-tight">
          <span className="text-primary">Ga</span>Link
          <span className="text-xs font-normal text-base-content/40 ml-2">Admin</span>
        </h1>
        <button className="btn btn-ghost btn-sm btn-circle md:hidden" onClick={() => setSidebarOpen(false)}>
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
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
    </>
  );

  return (
    <div className="min-h-screen flex bg-base-200">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute left-0 top-0 h-full w-60 bg-base-100 border-r border-base-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
      <aside className="hidden md:flex w-60 bg-base-100 border-r border-base-300 flex-col flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-30 bg-base-100 border-b border-base-300 px-4 h-14 flex items-center gap-3">
          <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-extrabold tracking-tight">
            <span className="text-primary">Ga</span>Link
            <span className="text-xs font-normal text-base-content/40 ml-2">Admin</span>
          </h1>
        </div>
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
