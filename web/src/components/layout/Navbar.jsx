import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Search,
  Bot,
  Film,
  MessageCircle,
  User,
  Plus,
  Sparkles,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Heart,
  UserCheck,
  MessageSquare,
  Video,
  Sun,
  Moon,
  Clock,
  X,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import useNotificationStore from "../../store/useNotificationStore";
import useThemeStore from "../../store/useThemeStore";
import { UserBadges } from "../badge/BadgeSystem";

const NAV_LINKS = [
  { to: "/feed", icon: Home, label: "Feed" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/ai-assistant", icon: Bot, label: "AI Assistant" },
  { to: "/reels", icon: Film, label: "Reels" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
];

const HISTORY_KEY = "galink_search_history";
const MAX_HISTORY = 8;
const RECOMMENDED_TAGS = [
  "React", "Node.js", "Graphic Design", "Video Editing",
  "Carpentry", "Electrician", "Plumbing", "Math Tutoring",
  "Social Media", "Aircon", "Python", "UI Design",
  "Welding", "Painting", "Swimming Lessons", "WordPress",
];

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(query) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const prev = getHistory().filter((h) => h.toLowerCase() !== trimmed.toLowerCase());
  localStorage.setItem(HISTORY_KEY, JSON.stringify([trimmed, ...prev].slice(0, MAX_HISTORY)));
}
function removeHistoryItem(item) {
  const updated = getHistory().filter((h) => h !== item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAllRead, connectSocket, disconnectSocket } = useNotificationStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState(getHistory);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Connect socket + fetch notifications on mount
  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
      fetchNotifications();
    }
    return () => disconnectSocket();
  }, [user?._id]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications && unreadCount > 0) markAllRead();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "like_post": return <Heart size={14} className="text-red-400" />;
      case "like_reel": return <Video size={14} className="text-pink-400" />;
      case "comment_post": return <MessageSquare size={14} className="text-blue-400" />;
      case "match": return <Sparkles size={14} className="text-amber-400" />;
      case "follow": return <UserCheck size={14} className="text-green-400" />;
      case "kyc_approved": return <CheckCircle size={14} className="text-success" />;
      case "selfie_approved": return <CheckCircle size={14} className="text-success" />;
      case "clearance_approved": return <CheckCircle size={14} className="text-success" />;
      case "kyc_rejected": return <XCircle size={14} className="text-error" />;
      case "selfie_rejected": return <XCircle size={14} className="text-error" />;
      case "clearance_rejected": return <XCircle size={14} className="text-error" />;
      case "verification_revoked": return <XCircle size={14} className="text-error" />;
      case "post_removed": return <Trash2 size={14} className="text-error" />;
      case "reel_removed": return <Trash2 size={14} className="text-error" />;
      default: return <Bell size={14} className="text-base-content/50" />;
    }
  };

  const getNotificationLink = (n) => {
    switch (n.type) {
      case "like_post":   return n.post?._id ? `/post/${n.post._id}` : "/feed";
      case "comment_post": return n.post?._id ? `/post/${n.post._id}?focus=comments` : "/feed";
      case "like_reel":  return "/reels";
      case "match":      return "/discover";
      case "follow":     return n.sender?._id ? `/profile/${n.sender._id}` : "/feed";
      case "kyc_approved":
      case "kyc_rejected":
      case "selfie_approved":
      case "selfie_rejected":
      case "clearance_approved":
      case "clearance_rejected":
      case "verification_revoked": return "/verification";
      case "post_removed": return "/feed";
      case "reel_removed": return "/reels";
      default:           return "/feed";
    }
  };

  const handleNotifClick = (n) => {
    setShowNotifications(false);
    navigate(getNotificationLink(n));
  };

  const getNotifText = (n) => {
    const name = n.sender?.name || "GaLink Admin";
    switch (n.type) {
      case "like_post": return `${name} liked your post`;
      case "like_reel": return `${name} liked your reel`;
      case "comment_post": return `${name} commented on your post`;
      case "match": return `${name} matched with you`;
      case "follow": return `${name} followed you`;
      case "kyc_approved": return n.message || "Your Government ID has been approved.";
      case "selfie_approved": return n.message || "Your selfie photo has been approved.";
      case "clearance_approved": return n.message || "Your clearance has been approved.";
      case "kyc_rejected": return `Government ID rejected${n.message ? `: ${n.message}` : ""}`;
      case "selfie_rejected": return `Selfie rejected${n.message ? `: ${n.message}` : ""}`;
      case "clearance_rejected": return `Clearance rejected${n.message ? `: ${n.message}` : ""}`;
      case "verification_revoked": return n.message || "Your verification has been revoked by an admin.";
      case "post_removed": return n.message || "Your post was removed by an admin.";
      case "reel_removed": return n.message || "Your reel was removed by an admin.";
      default: return `${name} sent you a notification`;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // ── Search overlay helpers ──
  const openSearch = () => {
    setShowSearch(true);
    setSearchQuery("");
    setSearchHistory(getHistory());
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };
  const closeSearch = () => setShowSearch(false);
  const doSearch = (q) => {
    const val = (q ?? searchQuery).trim();
    if (!val) return;
    saveHistory(val);
    setShowSearch(false);
    navigate(`/discover?q=${encodeURIComponent(val)}`);
  };
  const handleSearchSubmit = (e) => { e.preventDefault(); doSearch(searchQuery); };
  const handleRemoveHistory = (e, item) => {
    e.stopPropagation();
    removeHistoryItem(item);
    setSearchHistory(getHistory());
  };
  const searchSuggestions = searchQuery.trim()
    ? RECOMMENDED_TAGS.filter((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      {/* Desktop & Tablet navbar */}
      <nav className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5">
        <div className="w-full px-6 h-16 grid grid-cols-3 items-center">
          {/* Logo — left */}
          <Link to="/feed" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <img src={require('../../assets/Logo_GaLink.png')} alt="GaLink Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg bg-linear-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
              GaLink
            </span>
          </Link>

          {/* Center nav links — truly centered */}
          <div className="flex justify-center">
          <div className="hidden md:flex items-center bg-base-200/50 rounded-xl p-1 gap-0.5">
            {NAV_LINKS.map(({ to, icon: Icon, label }) => {
              const isActive = pathname === to || (to === "/discover" && pathname === "/discover");
              const isDiscover = to === "/discover";
              if (isDiscover) {
                return (
                  <button
                    key={to}
                    onClick={openSearch}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-content shadow-sm shadow-primary/25"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="hidden lg:inline">{label}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-sm shadow-primary/25"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 justify-end">
            {/* Create post button */}
            <div className="tooltip tooltip-bottom" data-tip={!user?.isVerified ? "Verified users only" : undefined}>
              <button
                className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => document.getElementById("post_modal").showModal()}
                disabled={!user?.isVerified}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline font-semibold">Post</span>
              </button>
            </div>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="btn btn-ghost btn-sm btn-circle relative"
              >
                <Bell size={20} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-base-100 rounded-2xl shadow-2xl border border-base-content/5 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-base-200/50 border-b border-base-content/5 flex items-center justify-between">
                    <p className="font-semibold text-sm">Notifications</p>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={28} className="mx-auto mb-2 text-base-content/20" />
                        <p className="text-sm text-base-content/40">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 30).map((n) => (
                        <button
                          key={n._id}
                          onClick={() => handleNotifClick(n)}
                          className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-base-content/5 last:border-0 transition-colors hover:bg-base-200/40 cursor-pointer ${
                            !n.isRead ? "bg-primary/5" : ""
                          }`}
                        >
                          {/* Sender avatar */}
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-base-content/10">
                              {n.sender?.profilePhoto ? (
                                <img src={n.sender.profilePhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="bg-linear-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center w-full h-full text-xs font-bold">
                                  {n.sender?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-base-100 flex items-center justify-center">
                              {getNotifIcon(n.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug">
                              {["kyc_approved","kyc_rejected","selfie_approved","selfie_rejected","clearance_approved","clearance_rejected","verification_revoked","post_removed","reel_removed"].includes(n.type) ? (
                                <span className={n.type.endsWith("_rejected") ? "text-error font-medium" : "text-success font-medium"}>
                                  {getNotifText(n)}
                                </span>
                              ) : (
                                <>
                                  <span className="font-semibold">{n.sender?.name}</span>{" "}
                                  <span className="text-base-content/70">{getNotifText(n).replace(n.sender?.name || "", "").trim()}</span>
                                </>
                              )}
                            </p>
                            {n.post?.content && (
                              <p className="text-xs text-base-content/40 truncate mt-0.5">"{n.post.content.slice(0, 60)}..."</p>
                            )}
                            <p className="text-xs text-base-content/40 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>

                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm btn-circle"
              title={theme === "corporate" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "corporate" ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
            </button>

            {/* User menu */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 px-1.5 py-1 rounded-xl hover:bg-base-200/60 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-base-content/10">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-linear-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center w-full h-full text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <ChevronDown size={14} className="text-base-content/40 hidden sm:block" />
              </div>

              <div
                tabIndex={0}
                className="dropdown-content mt-3 z-50 w-64 bg-base-100 rounded-2xl shadow-2xl border border-base-content/5 overflow-hidden"
              >
                {/* User info header */}
                <div className="px-4 py-3 bg-base-200/50 border-b border-base-content/5">
                  <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                    {user?.name}
                    <UserBadges user={user} size="xs" alwaysShow />
                  </p>
                  <p className="text-xs text-base-content/50 truncate">{user?.email}</p>
                </div>

                <ul className="menu menu-sm p-2">
                  <li>
                    <Link
                      to={`/profile/${user?._id}`}
                      className="flex items-center gap-2.5 rounded-lg"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/profile/${user?._id}`}
                      className="flex items-center gap-2.5 rounded-lg"
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/verification"
                      className="flex items-center gap-2.5 rounded-lg"
                    >
                      <ShieldCheck size={15} />
                      Verification
                    </Link>
                  </li>
                  {user?.isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-lg text-primary font-semibold"
                      >
                        <ShieldCheck size={15} />
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <div className="divider my-1 h-0" />
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 rounded-lg text-error hover:bg-error/10"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/90 backdrop-blur-xl border-t border-base-content/5 safe-area-bottom">
        <div className="flex items-center h-16">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to;
            const isDiscover = to === "/discover";
            if (isDiscover) {
              return (
                <button
                  key={to}
                  onClick={openSearch}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                    isActive ? "text-primary" : "text-base-content/40"
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              );
            }
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                  isActive ? "text-primary" : "text-base-content/40"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? "bg-primary/10" : ""
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {/* Notification bell in mobile nav */}
          <button
            onClick={handleBellClick}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors text-base-content/40 relative"
          >
            <div className="p-1.5 rounded-xl transition-all relative">
              <Bell size={20} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-1 min-w-4 h-4 px-0.5 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Alerts</span>
          </button>
        </div>
      </nav>

      {/* ══ Search Dropdown Card ══ */}
      {showSearch && (
        <>
          {/* Backdrop — dim but still shows content */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onMouseDown={closeSearch}
          />

          {/* Card — anchored just below the navbar */}
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-content/8 overflow-hidden">
              {/* Search input row */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-4 py-3 border-b border-base-content/6">
                <Search size={16} className="text-base-content/40 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search people, skills, or roles..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-base-content/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                    className="text-base-content/40 hover:text-base-content transition-colors"
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <button type="button" onClick={closeSearch} className="text-base-content/40 hover:text-base-content transition-colors">
                    <X size={15} />
                  </button>
                )}
              </form>

              {/* Dropdown content */}
              <div className="max-h-72 overflow-y-auto px-2 py-2">
                {/* Typeahead suggestions while typing */}
                {searchSuggestions.length > 0 && (
                  <div className="mb-1">
                    {searchSuggestions.slice(0, 5).map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => doSearch(s)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-base-200 text-sm text-left transition-colors"
                      >
                        <Search size={13} className="text-base-content/30 shrink-0" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent searches */}
                {!searchQuery.trim() && searchHistory.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold text-base-content/35 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                      <Clock size={11} /> Recent
                    </p>
                    {searchHistory.map((item) => (
                      <div key={item} className="flex items-center group">
                        <button
                          onMouseDown={() => doSearch(item)}
                          className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-base-200 text-sm transition-colors"
                        >
                          <Clock size={13} className="text-base-content/25 shrink-0" />
                          {item}
                        </button>
                        <button
                          onMouseDown={(e) => handleRemoveHistory(e, item)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:text-error transition-all"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular tags */}
                {!searchQuery.trim() && (
                  <div className="px-1 pb-1">
                    <p className="text-[11px] font-semibold text-base-content/35 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <TrendingUp size={11} /> Popular
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-2 pb-1">
                      {RECOMMENDED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onMouseDown={() => doSearch(tag)}
                          className="px-3 py-1 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content text-xs font-medium transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer action */}
              {searchQuery.trim() && (
                <div className="px-4 py-2.5 border-t border-base-content/6">
                  <button
                    onMouseDown={() => doSearch(searchQuery)}
                    className="flex items-center gap-2 w-full text-sm text-primary font-medium hover:underline"
                  >
                    <Search size={14} />
                    Search for &ldquo;{searchQuery}&rdquo;
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
