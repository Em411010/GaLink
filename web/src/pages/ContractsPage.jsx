import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contractAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import {
  FileText, CheckCircle, XCircle, AlertTriangle, Clock,
  Loader2, Inbox, ChevronRight, DollarSign,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "badge-warning", bar: "bg-warning", icon: Clock },
  active: { label: "Active", color: "badge-info", bar: "bg-info", icon: CheckCircle },
  completed: { label: "Completed", color: "badge-success", bar: "bg-success", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "badge-ghost", bar: "bg-base-300", icon: XCircle },
  disputed: { label: "Disputed", color: "badge-error", bar: "bg-error", icon: AlertTriangle },
};

const FILTERS = ["all", "pending", "active", "completed", "cancelled", "disputed"];

export default function ContractsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState("hirer");
  const [filter, setFilter] = useState("all");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractAPI.getMyContracts({ role: tab, status: "all" });
      setContracts(res.data.contracts);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, [tab]);

  const getOtherParty = (c) => tab === "hirer" ? c.freelancer : c.hirer;
  const getOtherRole = () => tab === "hirer" ? "Freelancer" : "Hirer";

  const filtered = filter === "all" ? contracts : contracts.filter((c) => c.status === filter);

  // Stats counts
  const counts = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = contracts.filter((c) => c.status === s).length;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={22} className="text-primary" />
          My Contracts
        </h1>
      </div>
      <div role="tablist" className="tabs tabs-boxed bg-base-200 w-fit">
        <button
          role="tab"
          className={`tab ${tab === "hirer" ? "tab-active" : ""}`}
          onClick={() => { setTab("hirer"); setFilter("all"); }}
        >
          As Hirer
        </button>
        <button
          role="tab"
          className={`tab ${tab === "freelancer" ? "tab-active" : ""}`}
          onClick={() => { setTab("freelancer"); setFilter("all"); }}
        >
          As Freelancer
        </button>
      </div>
      {!loading && contracts.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {FILTERS.slice(1).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "all" : s)}
                className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                  filter === s ? "border-primary bg-primary/10" : "border-base-200 bg-base-100 hover:border-primary/40"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.bar} mx-auto mb-1`} />
                <p className="text-lg font-bold leading-none">{counts[s]}</p>
                <p className="text-[10px] text-base-content/50 mt-0.5 leading-tight">{cfg.label}</p>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-base-content/40 mr-1">Filter:</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`badge badge-sm cursor-pointer transition-all py-2.5 ${
              filter === f ? "badge-primary" : "badge-ghost hover:badge-neutral"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && counts[f] > 0 && (
              <span className="ml-1 opacity-60">{counts[f]}</span>
            )}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-base-content/50">
          <Inbox size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold">No contracts found</p>
          <p className="text-sm mt-1 text-base-content/40">
            {filter !== "all"
              ? `No ${filter} contracts.`
              : tab === "hirer"
              ? "You haven't created any contracts yet. Find a freelancer and hire them!"
              : "You haven't received any contracts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const other = getOtherParty(c);
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const isPendingAction = c.status === "pending" && tab === "freelancer";
            const isActive = c.status === "active";

            return (
              <Link
                key={c._id}
                to={`/contracts/${c._id}`}
                className={`flex items-center gap-0 bg-base-100 rounded-xl border transition-all hover:shadow-md group overflow-hidden ${
                  isPendingAction ? "border-warning/50" : "border-base-200"
                }`}
              >
                <div className={`w-1 self-stretch ${cfg.bar} shrink-0`} />

                <div className="flex flex-1 items-center gap-3 p-4 min-w-0">
                  <div className="avatar shrink-0">
                    <div className="w-10 h-10 rounded-full">
                      {other?.profilePhoto ? (
                        <img src={other.profilePhoto} alt={other.name} className="object-cover" />
                      ) : (
                        <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center font-bold text-sm rounded-full">
                          {other?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm line-clamp-1">{c.title}</h3>
                      <span className={`badge ${cfg.color} badge-xs gap-0.5 shrink-0`}>
                        <StatusIcon size={9} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/50 mt-0.5">
                      {getOtherRole()}: <span className="font-medium text-base-content/65">{other?.name}</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span className="opacity-50">{new Date(c.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </p>
                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {c.skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="badge badge-outline badge-xs py-1.5 opacity-70">{s}</span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="text-[10px] text-base-content/40">+{c.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                    {isPendingAction && (
                      <p className="text-[11px] text-warning font-semibold mt-1 flex items-center gap-1">
                        <Clock size={10} /> Action required — waiting for your response
                      </p>
                    )}
                    {isActive && (
                      <p className="text-[11px] text-info font-medium mt-1 flex items-center gap-1">
                        <CheckCircle size={10} /> In progress
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.amount > 0 && (
                      <span className="font-bold text-sm flex items-center gap-0.5">
                        <DollarSign size={12} className="text-base-content/40" />
                        ₱{c.amount.toLocaleString()}{c.rateType === "hourly" ? "/hr" : ""}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-base-content/25 group-hover:text-primary transition-colors mt-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

