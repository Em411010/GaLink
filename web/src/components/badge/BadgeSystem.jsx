import { Shield, ShieldCheck, Briefcase, Star } from "lucide-react";
import { Link } from "react-router-dom";

const BADGE_CONFIG = {
  0: {
    label: "Unverified",
    icon: Shield,
    color: "text-base-content/40",
    bg: "bg-base-300/50",
    border: "border-base-300",
    ring: "ring-base-300",
    gradient: "from-base-300 to-base-200",
  },
  1: {
    label: "Hirer",
    icon: ShieldCheck,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    ring: "ring-success",
    gradient: "from-success/20 to-success/5",
    emoji: "🟢",
  },
  2: {
    label: "Freelancer",
    icon: Briefcase,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    ring: "ring-info",
    gradient: "from-info/20 to-info/5",
    emoji: "🔵",
  },
  3: {
    label: "Verified Freelancer",
    icon: Star,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    ring: "ring-warning",
    gradient: "from-warning/20 to-warning/5",
    emoji: "⭐",
  },
};

/** Small inline badge pill — use next to usernames */
export function BadgePill({ level = 0, size = "sm" }) {
  const cfg = BADGE_CONFIG[level] || BADGE_CONFIG[0];
  const Icon = cfg.icon;
  const sizeClass = size === "xs" ? "text-[10px] gap-0.5 px-1.5 py-0" : "text-xs gap-1 px-2 py-0.5";
  const iconSize = size === "xs" ? 10 : 12;
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
      <Icon size={iconSize} />
      {cfg.label}
    </span>
  );
}

/** Larger badge card shown on profile page */
export function BadgeCard({ level = 0, showUpgrade = false }) {
  const cfg = BADGE_CONFIG[level] || BADGE_CONFIG[0];
  const Icon = cfg.icon;
  return (
    <div className={`card border ${cfg.border} bg-gradient-to-br ${cfg.gradient} shadow-sm`}>
      <div className="card-body p-4 flex-row items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">Badge Level {level}</p>
          <p className={`text-lg font-bold ${cfg.color}`}>
            {cfg.emoji && <span className="mr-1">{cfg.emoji}</span>}
            {cfg.label}
          </p>
        </div>
        {showUpgrade && level < 3 && (
          <Link to="/verification" className="btn btn-sm btn-primary gap-1">
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}

/** Access-locked overlay — shows when user tries to access a feature above their level */
export function AccessGate({ requiredLevel, currentLevel, feature, children }) {
  if (currentLevel >= requiredLevel) return children;
  const cfg = BADGE_CONFIG[requiredLevel];
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="card bg-base-100 shadow-xl border border-base-300 max-w-sm w-full mx-4">
          <div className="card-body items-center text-center p-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.color} mb-2`}>
              <cfg.icon size={32} />
            </div>
            <h3 className="font-bold text-lg">
              {cfg.emoji} {cfg.label} Badge Required
            </h3>
            <p className="text-sm text-base-content/60 mt-1">
              {feature || "This feature"} requires the <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span> badge to unlock.
            </p>
            <Link to="/verification" className="btn btn-primary btn-sm mt-3 gap-1">
              <ShieldCheck size={14} />
              Complete Verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { BADGE_CONFIG };
export default BadgePill;

/** Shows all earned badges for a user — Hirer and Freelancer can appear simultaneously */
export function UserBadges({ user, size = "xs", alwaysShow = false }) {
  const level = user?.badgeLevel || 0;
  const isHirer = user?.isHirer || level >= 1;  // fallback: any verified user can hire
  const badges = [];

  if (isHirer) badges.push(<BadgePill key="hirer" level={1} size={size} />);
  if (level === 2) badges.push(<BadgePill key="fl" level={2} size={size} />);
  if (level >= 3) badges.push(<BadgePill key="vf" level={3} size={size} />);

  if (!badges.length) {
    if (!alwaysShow) return null;
    return <BadgePill level={0} size={size} />;
  }
  return <span className="inline-flex items-center gap-1">{badges}</span>;
}
