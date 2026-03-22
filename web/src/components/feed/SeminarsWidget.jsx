import { useState, useEffect } from "react";
import { GraduationCap, MapPin, Calendar, ExternalLink, RefreshCw, Wifi, WifiOff, Tag, Sparkles } from "lucide-react";
import { userAPI } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";

const CATEGORY_COLORS = {
  Tech: "badge-info",
  Trades: "badge-warning",
  Business: "badge-success",
  Creative: "badge-secondary",
  "Soft Skills": "badge-accent",
  "Health & Wellness": "badge-error",
};

export default function SeminarsWidget() {
  const { user } = useAuthStore();
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await userAPI.getSeminars(isRefresh);
      setSeminars(res.data || []);
    } catch {
      setSeminars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const hasSkills = user?.skills?.length > 0;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
            <GraduationCap size={13} className="text-primary" />
            {hasSkills ? "Recommended Seminars" : "Seminars & Workshops"}
          </h3>
          <button
            onClick={() => load(true)}
            disabled={refreshing || loading}
            className="btn btn-ghost btn-xs btn-circle"
            title="Refresh recommendations"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-base-content/40">
          <Sparkles size={10} className="text-primary/60" />
          {hasSkills
            ? `AI-matched to your skills`
            : "Tech · Trades · Metro Manila picks"}
        </div>
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="h-3 bg-base-300 rounded w-3/4" />
                <div className="h-2.5 bg-base-300 rounded w-1/2" />
                <div className="h-2 bg-base-300 rounded w-full" />
              </div>
            ))}
          </div>
        )}
        {!loading && seminars.length === 0 && (
          <p className="text-xs text-base-content/40 text-center py-3">
            Could not load recommendations. Try refreshing.
          </p>
        )}

        {!loading && seminars.length > 0 && (
          <div className="space-y-3">
            {seminars.map((s, i) => {
              const isOpen = expanded === i;
              const badgeClass = CATEGORY_COLORS[s.category] || "badge-ghost";
              return (
                <div
                  key={i}
                  className="border border-base-200 rounded-xl p-3 hover:border-primary/30 hover:bg-base-50 transition-all cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-2">{s.title}</p>
                      <p className="text-[10px] text-base-content/50 mt-0.5">{s.organizer}</p>
                    </div>
                    <span className={`badge badge-xs shrink-0 ${badgeClass}`}>{s.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                    {s.date && (
                      <span className="flex items-center gap-1 text-[10px] text-base-content/50">
                        <Calendar size={9} /> {s.date}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-base-content/50">
                      {s.isOnline ? <Wifi size={9} /> : <MapPin size={9} />}
                      {s.isOnline ? "Online" : s.location?.split(",")[0]}
                    </span>
                    {s.fee && (
                      <span className={`text-[10px] font-medium ${s.fee === "Free" ? "text-success" : "text-base-content/60"}`}>
                        {s.fee === "Free" ? "🆓 Free" : s.fee}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2.5 border-t border-base-200 pt-2.5">
                      <p className="text-[11px] text-base-content/70 leading-relaxed">{s.description}</p>
                      {s.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {s.skills.map((sk) => (
                            <span key={sk} className="badge badge-xs badge-outline gap-0.5">
                              <Tag size={7} /> {sk}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.link && (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-primary btn-xs gap-1.5 w-full"
                        >
                          <ExternalLink size={11} /> View Event
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[9px] text-base-content/30 text-center">
          AI-matched · Links go to official workshop &amp; seminar platforms
        </p>
      </div>
    </div>
  );
}
