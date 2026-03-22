import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, MessageCircle, Briefcase, Navigation, CheckCircle, FileText } from "lucide-react";
import { UserBadges } from "../badge/BadgeSystem";
import useAuthStore from "../../store/useAuthStore";
import ContractModal from "../contract/ContractModal";

export default function FreelancerCard({ freelancer, prefill }) {
  const { user } = useAuthStore();
  const [showContract, setShowContract] = useState(false);
  const isOwnCard = user?._id === freelancer._id;
  const matchScore = freelancer.matchScore;
  const matchColor =
    matchScore >= 80 ? "badge-success" :
    matchScore >= 55 ? "badge-primary" :
    "badge-warning";

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
      <div className="card-body p-4 gap-2">
        <div className="flex items-start gap-3">
          <div className="avatar shrink-0">
            <div className="w-11 rounded-full ring ring-primary/20">
              {freelancer.profilePhoto ? (
                <img src={freelancer.profilePhoto} alt={freelancer.name} />
              ) : (
                <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-base font-bold rounded-full">
                  {freelancer.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${freelancer._id}`}
              className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-1"
            >
              {freelancer.name}
            </Link>
            <UserBadges user={freelancer} size="xs" />
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={12} className="text-warning" fill="currentColor" />
              <span className="text-xs font-medium">
                {freelancer.averageRating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-xs text-base-content/40">
                ({freelancer.totalRatings || 0})
              </span>
            </div>
          </div>
          {matchScore !== undefined && (
            <span
              className={`badge ${matchColor} badge-sm shrink-0 whitespace-nowrap font-semibold`}
            >
              {matchScore}% match
            </span>
          )}
        </div>
        {freelancer.bio && (
          <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed">
            {freelancer.bio}
          </p>
        )}
        {freelancer.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {freelancer.skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="badge badge-outline badge-xs py-2">
                {skill}
              </span>
            ))}
            {freelancer.skills.length > 4 && (
              <span className="badge badge-ghost badge-xs py-2">
                +{freelancer.skills.length - 4} more
              </span>
            )}
          </div>
        )}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/50">
          {freelancer.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{freelancer.location.split(",")[0]}</span>
            </span>
          )}
          {freelancer.distanceKm !== undefined && (
            <span className="flex items-center gap-1 shrink-0 text-primary font-medium">
              <Navigation size={11} />
              {freelancer.distanceKm} km
            </span>
          )}
          {freelancer.yearsOfExperience > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <Briefcase size={11} />
              {freelancer.yearsOfExperience}y exp
            </span>
          )}
          {freelancer.completedJobs > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <CheckCircle size={11} />
              {freelancer.completedJobs} jobs
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <Link
            to={`/profile/${freelancer._id}`}
            className="btn btn-ghost btn-xs flex-1 border border-base-300"
          >
            View Profile
          </Link>
          <Link
            to={`/messages?userId=${freelancer._id}`}
            className="btn btn-primary btn-xs flex-1 gap-1"
          >
            <MessageCircle size={12} />
            Message
          </Link>
          {!isOwnCard && (
            <button
              onClick={() => setShowContract(true)}
              className="btn btn-secondary btn-xs flex-1 gap-1"
            >
              <FileText size={12} />
              Hire
            </button>
          )}
        </div>

        {showContract && (
          <ContractModal
            freelancer={freelancer}
            prefill={prefill || {}}
            onClose={() => setShowContract(false)}
          />
        )}

      </div>
    </div>
  );
}

