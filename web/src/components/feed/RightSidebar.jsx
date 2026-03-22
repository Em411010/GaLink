import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star, MapPin, TrendingUp, Briefcase, Users,
  FileText, Bot, Sparkles, ChevronRight,
} from "lucide-react";
import { userAPI } from "../../services/api";
import { UserBadges } from "../badge/BadgeSystem";

export default function RightSidebar() {
  const [data, setData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [sidebarRes, suggestRes] = await Promise.all([
          userAPI.getSidebarData(),
          userAPI.getSuggestedUsers(),
        ]);
        if (!cancelled) {
          setData(sidebarRes.data);
          setSuggestions(suggestRes.data);
        }
      } catch {
        // Sidebar data is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <aside className="hidden lg:block w-full space-y-4 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-4 pl-4 scrollbar-thin">
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      </aside>
    );
  }

  if (!data) return null;

  const { topFreelancers, trendingSkills, hiringPosts, stats } = data;

  return (
    <aside className="hidden lg:block w-full space-y-4 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-4 scrollbar-thin">
      {topFreelancers.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
                <Star size={12} className="text-warning" /> Top Verified
              </h3>
              <Link to="/discover" className="text-[10px] text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {topFreelancers.map((f) => (
                <Link
                  key={f._id}
                  to={`/profile/${f._id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="avatar shrink-0">
                    <div className="w-9 rounded-full ring-1 ring-base-300">
                      {f.profilePhoto ? (
                        <img src={f.profilePhoto} alt={f.name} />
                      ) : (
                        <div className="bg-warning/20 text-warning flex items-center justify-center w-full h-full text-sm font-bold rounded-full">
                          {f.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{f.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-base-content/50">
                      {f.averageRating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star size={10} className="text-warning fill-warning" />
                          {f.averageRating.toFixed(1)}
                        </span>
                      )}
                      {f.location && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin size={10} /> {f.location.split(",")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-base-content/20 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {trendingSkills.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-info" /> Trending Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {trendingSkills.map((s) => (
                <Link
                  key={s.name}
                  to={`/discover?q=${encodeURIComponent(s.name)}`}
                  className="badge badge-sm badge-outline hover:badge-primary hover:text-primary-content transition-colors cursor-pointer gap-1"
                >
                  {s.name}
                  <span className="text-[9px] opacity-60">{s.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {hiringPosts.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
              <Briefcase size={12} className="text-success" /> Active Jobs
            </h3>
            <div className="space-y-2.5">
              {hiringPosts.map((post) => (
                <Link
                  key={post._id}
                  to={`/post/${post._id}`}
                  className="block p-2.5 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
                >
                  <p className="text-xs font-medium line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-base-content/50">
                    <FileText size={10} />
                    {post.author?.name || "Unknown"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
              <Users size={12} className="text-secondary" /> People You May Know
            </h3>
            <div className="space-y-3">
              {suggestions.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u._id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="avatar shrink-0">
                    <div className="w-8 rounded-full ring-1 ring-base-300">
                      {u.profilePhoto ? (
                        <img src={u.profilePhoto} alt={u.name} />
                      ) : (
                        <div className="bg-secondary/20 text-secondary flex items-center justify-center w-full h-full text-xs font-bold rounded-full">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{u.name}</p>
                    <div className="flex items-center gap-1">
                      <UserBadges user={u} size="xs" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-sm">
        <div className="card-body p-4 gap-2 items-center text-center">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Bot size={20} className="text-secondary" />
          </div>
          <p className="text-sm font-semibold">Need a skilled worker?</p>
          <p className="text-[11px] text-base-content/50">Let AI match you with the perfect freelancer based on your needs</p>
          <Link to="/ai-assistant" className="btn btn-secondary btn-sm gap-1.5 mt-1">
            <Bot size={14} /> Find a Match
          </Link>
        </div>
      </div>
    </aside>
  );
}
