import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { userAPI, ratingAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Star,
  MapPin,
  FileText,
  Upload,
  MessageCircle,
  Briefcase,
  Shield,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { UserBadges, BadgeCard } from "../components/badge/BadgeSystem";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    workQuality: 5,
    communication: 5,
    reliability: 5,
    comment: "",
  });

  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = id || currentUser?._id;

  useEffect(() => {
    if (!profileId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, ratingsRes] = await Promise.all([
          userAPI.getProfile(profileId),
          ratingAPI.getUserRatings(profileId),
        ]);
        setProfile(profileRes.data);
        setRatings(ratingsRes.data.ratings || []);
        setRatingStats(ratingsRes.data.stats);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await userAPI.uploadResume(formData);
      toast.success("Resume uploaded — Freelancer mode unlocked!");
      updateUser(res.data.user);
      setProfile(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  const handleRating = async (e) => {
    e.preventDefault();
    try {
      await ratingAPI.createRating(profileId, ratingForm);
      toast.success("Rating submitted!");
      setShowRatingForm(false);
      const res = await ratingAPI.getUserRatings(profileId);
      setRatings(res.data.ratings);
      setRatingStats(res.data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt={profile.name} />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-3xl font-bold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold flex items-center gap-2 justify-center sm:justify-start">
                {profile.name}
                <UserBadges user={profile} alwaysShow />
              </h1>
              {profile.bio && (
                <p className="text-base-content/70 mt-1">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start text-sm">
                {profile.location?.address && (
                  <span className="flex items-center gap-1 text-base-content/60">
                    <MapPin size={14} />
                    {profile.location.address}
                  </span>
                )}
                <span className="flex items-center gap-1 text-warning">
                  <Star size={14} fill="currentColor" />
                  {profile.averageRating?.toFixed(1) || "0.0"} ({profile.totalRatings || 0} ratings)
                </span>
                {profile.isFreelancer && (
                  <span className="badge badge-primary gap-1">
                    <Briefcase size={12} />
                    Freelancer
                  </span>
                )}
                {profile.availability && (
                  <span
                    className={`badge badge-sm ${
                      profile.availability === "available"
                        ? "badge-success"
                        : profile.availability === "busy"
                        ? "badge-warning"
                        : "badge-ghost"
                    }`}
                  >
                    {profile.availability}
                  </span>
                )}
              </div>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Link
                  to={`/messages?userId=${profile._id}`}
                  className="btn btn-primary btn-sm gap-1"
                >
                  <MessageCircle size={14} />
                  Message
                </Link>
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="btn btn-outline btn-sm gap-1"
                >
                  <Star size={14} />
                  Rate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge Card */}
      <BadgeCard level={profile.badgeLevel} showUpgrade={isOwnProfile} />

      {isOwnProfile && profile.badgeLevel < 3 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center">
            <Shield className="mx-auto text-primary mb-2" size={40} />
            <h3 className="font-bold text-lg">
              {profile.badgeLevel === 0 ? "Get Verified to Unlock Features" : "Upgrade Your Badge"}
            </h3>
            <p className="text-sm text-base-content/60 mb-3">
              {profile.badgeLevel === 0
                ? "Verify your identity to message, comment, and use the AI assistant."
                : profile.badgeLevel === 1
                ? "Complete your freelancer profile to post and get matched with clients."
                : "Upload clearance and earn a rating to get the verified badge."}
            </p>
            <Link to="/verification" className="btn btn-primary gap-2 mx-auto">
              <Upload size={16} />
              {profile.badgeLevel === 0 ? "Start Verification" : "Continue Verification"}
            </Link>
          </div>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="badge badge-primary badge-outline">
                  {skill}
                </span>
              ))}
            </div>
            {profile.experience && (
              <p className="mt-3 text-sm text-base-content/60">
                <FileText size={14} className="inline mr-1" />
                Experience: {profile.experience}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Section */}
      {profile.portfolio?.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <FolderOpen size={16} /> Portfolio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.portfolio.map((item) => (
                <div key={item._id} className="bg-base-200/50 rounded-xl p-3 flex flex-col gap-1">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="rounded-lg w-full h-32 object-cover" />
                  )}
                  <p className="font-semibold text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-base-content/60 line-clamp-2">{item.description}</p>
                  )}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs gap-1 mt-auto self-start">
                      <ExternalLink size={12} /> View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRatingForm && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold mb-3">Rate {profile.name}</h3>
            <form onSubmit={handleRating} className="space-y-3">
              {["workQuality", "communication", "reliability"].map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <label className="w-32 capitalize text-sm">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <div className="rating">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <input
                        key={v}
                        type="radio"
                        name={field}
                        className="mask mask-star-2 bg-warning"
                        checked={ratingForm[field] === v}
                        onChange={() =>
                          setRatingForm({ ...ratingForm, [field]: v })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
              <textarea
                placeholder="Optional comment..."
                className="textarea textarea-bordered w-full"
                rows={2}
                value={ratingForm.comment}
                onChange={(e) =>
                  setRatingForm({ ...ratingForm, comment: e.target.value })
                }
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Submit Rating
              </button>
            </form>
          </div>
        </div>
      )}

      {ratings.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold mb-3">
              Reviews ({ratingStats?.total || 0})
            </h3>
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r._id} className="border-b border-base-300 pb-3 last:border-none">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {r.rater?.name || "Anonymous"}
                    </span>
                    <div className="flex items-center text-warning">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs ml-1">{r.overall}</span>
                    </div>
                    <span className="text-xs text-base-content/50 ml-auto">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-base-content/70">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
