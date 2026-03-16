import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { Link } from "react-router-dom";
import {
  Users, ShieldCheck, Clock, FileText,
  Film, TrendingUp, UserPlus, Ban,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "text-base-content", to }) {
  const inner = (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4 flex-row items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center ${color}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value ?? "—"}</p>
          <p className="text-xs text-base-content/50">{label}</p>
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const BADGE_COLORS = { 0: "badge-ghost", 1: "badge-success", 2: "badge-info", 3: "badge-warning" };
const BADGE_LABELS = { 0: "Unverified", 1: "Hirer 🟢", 2: "Freelancer 🔵", 3: "Verified ⭐" };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-base-content/50 text-sm">Platform statistics at a glance</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats?.total} to="/admin/users" />
        <StatCard icon={Clock} label="Pending Clearances" value={stats?.pendingClearances} color="text-warning" to="/admin/clearances" />
        <StatCard icon={FileText} label="Total Posts" value={stats?.totalPosts} color="text-info" to="/admin/posts" />
        <StatCard icon={Film} label="Total Reels" value={stats?.totalReels} color="text-secondary" to="/admin/reels" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={UserPlus} label="New Users (7d)" value={stats?.recentUsers} color="text-success" />
        <StatCard icon={ShieldCheck} label="Pending KYC" value={stats?.pendingKYC} color="text-info" />
        <StatCard icon={Ban} label="Banned Users" value={stats?.banned} color="text-error" />
        <StatCard icon={TrendingUp} label="Verified Freelancers" value={stats?.levelMap?.[3]} color="text-warning" />
      </div>

      {/* Badge breakdown */}
      {stats && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="font-bold text-sm mb-3">Badge Distribution</h2>
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2, 3].map((lvl) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span className={`badge ${BADGE_COLORS[lvl]} gap-1`}>{BADGE_LABELS[lvl]}</span>
                  <span className="text-lg font-bold">{stats.levelMap?.[lvl] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
