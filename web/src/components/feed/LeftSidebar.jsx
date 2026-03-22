import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Star, Pencil, Briefcase,
  ShieldCheck,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { userAPI } from "../../services/api";
import { UserBadges } from "../badge/BadgeSystem";
import SeminarsWidget from "./SeminarsWidget";
import toast from "react-hot-toast";

const BADGE_STEPS = {
  0: [
    { done: (u) => u.emailVerified, label: "Verify your email" },
    { done: (u) => u.governmentId?.verified, label: "Upload government ID" },
    { done: (u) => u.selfieVerified, label: "Take a selfie for KYC" },
  ],
  1: [
    { done: (u) => u.isFreelancer, label: "Set up freelancer profile" },
    { done: (u) => u.skills?.length > 0, label: "Add your skills" },
    { done: (u) => !!u.resumeUrl, label: "Upload your resume" },
  ],
  2: [
    { done: (u) => u.clearance?.verified, label: "Upload NBI/Police clearance" },
    { done: (u) => u.portfolio?.length > 0, label: "Add portfolio items" },
    { done: (u) => u.averageRating >= 4.0, label: "Earn a 4.0+ rating" },
  ],
};

const BADGE_LABELS = ["Unverified", "Hirer", "Freelancer", "Verified Freelancer"];

export default function LeftSidebar() {
  const { user, updateUser } = useAuthStore();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await userAPI.toggleAvailability();
      updateUser({ ...user, isOpenForWork: res.data.isOpenForWork });
      toast.success(res.data.isOpenForWork ? "You're now open for work!" : "Availability turned off");
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setToggling(false);
    }
  };

  if (!user) return null;

  const badgeLevel = user.badgeLevel || 0;
  const steps = BADGE_STEPS[badgeLevel] || [];
  const completedSteps = steps.filter((s) => s.done(user)).length;
  const progress = steps.length ? Math.round((completedSteps / steps.length) * 100) : 100;
  const nextLabel = badgeLevel < 3 ? BADGE_LABELS[badgeLevel + 1] : null;

  return (
    <aside className="hidden md:block w-full space-y-4 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-4 pr-4 scrollbar-thin">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${user._id}`} className="avatar shrink-0">
              <div className="w-12 rounded-full ring ring-primary/20">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-lg font-bold rounded-full">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/profile/${user._id}`} className="font-semibold text-sm truncate block hover:text-primary transition-colors">
                {user.name}
              </Link>
              <UserBadges user={user} size="xs" alwaysShow />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-base-content/60">
            {user.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-warning fill-warning" />
                {user.averageRating.toFixed(1)} ({user.totalRatings})
              </span>
            )}
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {user.location}
              </span>
            )}
          </div>
        </div>
      </div>
      {badgeLevel < 3 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Badge Progress</h3>
              <span className="text-xs font-medium text-primary">{progress}%</span>
            </div>
            <progress className="progress progress-primary w-full h-2" value={progress} max="100" />
            <p className="text-[11px] text-base-content/50">
              Complete to unlock <span className="font-semibold text-primary">{nextLabel}</span>
            </p>
            <ul className="space-y-1.5 mt-1">
              {steps.map((step, i) => {
                const isDone = step.done(user);
                return (
                  <li key={i} className={`flex items-center gap-2 text-xs ${isDone ? "text-success line-through" : "text-base-content/70"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isDone ? "bg-success text-success-content" : "bg-base-300 text-base-content/40"}`}>
                      {isDone ? "✓" : i + 1}
                    </span>
                    {step.label}
                  </li>
                );
              })}
            </ul>
            <Link to="/verification" className="btn btn-primary btn-xs mt-2 gap-1">
              <ShieldCheck size={12} /> Continue Verification
            </Link>
          </div>
        </div>
      )}
      {user.skills?.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">My Skills</h3>
              <Link to={`/profile/${user._id}`} className="btn btn-ghost btn-xs gap-1 text-primary">
                <Pencil size={10} /> Edit
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.slice(0, 8).map((skill) => (
                <span key={skill} className="badge badge-sm badge-outline">{skill}</span>
              ))}
              {user.skills.length > 8 && (
                <span className="badge badge-sm badge-ghost">+{user.skills.length - 8}</span>
              )}
            </div>
          </div>
        </div>
      )}
      {user.isFreelancer && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-base-content/50" />
                <span className="text-sm font-medium">Open for Work</span>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={user.isOpenForWork || false}
                onChange={handleToggle}
                disabled={toggling}
              />
            </div>
            <p className="text-[11px] text-base-content/50">
              {user.isOpenForWork ? "Hirers can see you're available" : "Turn on to attract job offers"}
            </p>
          </div>
        </div>
      )}
      <SeminarsWidget />
    </aside>
  );
}
