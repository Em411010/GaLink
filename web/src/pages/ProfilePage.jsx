import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { userAPI, ratingAPI, contractAPI } from "../services/api";
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
  Download,
  Sparkles,
  Clock,
  DollarSign,
  CheckCircle,
  Calendar,
  X,
  Pencil,
  Check,
  RefreshCw,
  FileCheck,
  ArrowRight,
  User,
} from "lucide-react";
import { UserBadges, BadgeCard } from "../components/badge/BadgeSystem";
import ContractModal from "../components/contract/ContractModal";
import useGeoLocation from "../hooks/useGeoLocation";

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

  const resumeInputRef = useRef(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState("");
  const [contracts, setContracts] = useState([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const { setManualLocation, refreshLocation, loading: locationLoading } = useGeoLocation();

  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = id || currentUser?._id;

  useEffect(() => {
    if (!profileId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, ratingsRes, contractsRes] = await Promise.all([
          userAPI.getProfile(profileId),
          ratingAPI.getUserRatings(profileId),
          contractAPI.getUserContracts(profileId),
        ]);
        setProfile(profileRes.data);
        setRatings(ratingsRes.data.ratings || []);
        setRatingStats(ratingsRes.data.stats);
        setContracts(contractsRes.data.contracts || []);
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
    setResumeUploading(true);
    try {
      const res = await userAPI.uploadResume(formData);
      const skillCount = res.data.extractedData?.skills?.length || 0;
      toast.success(
        skillCount > 0
          ? `Resume uploaded! ${skillCount} skill${skillCount > 1 ? "s" : ""} auto-extracted from your resume.`
          : "Resume uploaded — Freelancer mode unlocked!"
      );
      updateUser(res.data.user);
      setProfile(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
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
    <>
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
                {isOwnProfile && editingLocation ? (
                  <form
                    className="flex items-center gap-1"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const val = locationDraft.trim();
                      if (val) {
                        await setManualLocation(val);
                        setProfile((p) => ({ ...p, location: val }));
                        toast.success("Location updated");
                      }
                      setEditingLocation(false);
                    }}
                  >
                    <MapPin size={14} className="text-primary shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      className="input input-xs input-bordered w-56"
                      placeholder="City, Province, Philippines"
                      value={locationDraft}
                      onChange={(e) => setLocationDraft(e.target.value)}
                    />
                    <button type="submit" className="btn btn-ghost btn-xs btn-circle text-success"><Check size={14} /></button>
                    <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={() => setEditingLocation(false)}><X size={14} /></button>
                  </form>
                ) : profile.location ? (
                  <span
                    className={`flex items-center gap-1 text-base-content/60 ${isOwnProfile ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                    onClick={() => {
                      if (!isOwnProfile) return;
                      setLocationDraft(profile.location);
                      setEditingLocation(true);
                    }}
                  >
                    <MapPin size={14} />
                    {profile.location}
                    {isOwnProfile && <Pencil size={10} className="ml-0.5 opacity-40" />}
                  </span>
                ) : isOwnProfile ? (
                  <button
                    className="flex items-center gap-1 text-base-content/40 hover:text-primary transition-colors text-sm"
                    onClick={() => {
                      setLocationDraft("");
                      setEditingLocation(true);
                    }}
                  >
                    <MapPin size={14} />
                    Set your location
                  </button>
                ) : null}
                {isOwnProfile && !editingLocation && (
                  <button
                    className="btn btn-ghost btn-xs gap-1 text-base-content/40 hover:text-primary"
                    disabled={locationLoading}
                    onClick={async () => {
                      const addr = await refreshLocation();
                      if (addr) {
                        setProfile((p) => ({ ...p, location: addr }));
                        toast.success("Location refreshed");
                      } else {
                        toast.error("Could not detect location");
                      }
                    }}
                  >
                    <RefreshCw size={12} className={locationLoading ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">{locationLoading ? "Detecting..." : "Refresh"}</span>
                  </button>
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
                <button
                  onClick={() => setShowContractModal(true)}
                  className="btn btn-secondary btn-sm gap-1"
                >
                  <FileCheck size={14} />
                  Hire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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
      {(isOwnProfile || profile.resumeUrl) && (
        <div className="card bg-base-100 shadow-md relative overflow-hidden">
          {resumeUploading && (
            <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
              <span className="loading loading-spinner loading-md text-primary" />
              <div className="text-center">
                <p className="text-sm font-semibold">Uploading &amp; Analyzing Resume…</p>
                <p className="text-xs text-base-content/50 mt-0.5">AI is extracting your skills. This may take a few seconds.</p>
              </div>
            </div>
          )}
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold flex items-center gap-2">
                <FileText size={16} /> Resume
              </h3>
              {isOwnProfile && (
                <>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <button
                    className="btn btn-outline btn-xs gap-1"
                    disabled={resumeUploading}
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    <Upload size={12} />
                    {profile.resumeUrl ? "Replace" : "Upload"}
                  </button>
                </>
              )}
            </div>
            {profile.resumeUrl ? (
              <div className="flex flex-col gap-1.5">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm gap-2 self-start"
                >
                  <Download size={14} /> View / Download Resume
                </a>
                {profile.resumeUploadedAt && (
                  <p className="text-xs text-base-content/40 flex items-center gap-1">
                    <FileText size={11} />
                    Uploaded {new Date(profile.resumeUploadedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </div>
            ) : (
              isOwnProfile && (
                <p className="text-sm text-base-content/50">
                  No resume uploaded yet. Upload a PDF or DOCX and your skills will be auto-extracted.
                </p>
              )
            )}
          </div>
        </div>
      )}
      {(profile.skills?.length > 0 || profile.serviceCategories?.length > 0 || isOwnProfile) && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            {profile.serviceCategories?.length > 0 && (
              <>
                <h3 className="font-bold mb-2">Service Categories</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.serviceCategories.map((cat, i) => (
                    <span key={i} className="badge badge-primary">
                      {cat}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold flex items-center gap-2"><Sparkles size={15} className="text-primary" /> Skills</h3>
              {isOwnProfile && (
                <span className="text-[11px] text-base-content/40 flex items-center gap-1">
                  <FileText size={11} /> Auto-extracted from resume
                </span>
              )}
            </div>
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="badge badge-primary badge-outline">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              isOwnProfile && (
                <p className="text-sm text-base-content/50">
                  No skills detected yet. Upload your resume above and our AI will extract your skills automatically.
                </p>
              )
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-base-content/60">
              {profile.yearsOfExperience > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {profile.yearsOfExperience} year{profile.yearsOfExperience !== 1 ? "s" : ""} experience
                </span>
              )}
              {!profile.yearsOfExperience && profile.experience && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {profile.experience}
                </span>
              )}
              {profile.hourlyRate > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  ₱{profile.hourlyRate}/hr
                  {profile.rateType && profile.rateType !== "hourly" && ` (${profile.rateType.replace("_", " ")})`}
                </span>
              )}
              {profile.completedJobs > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  {profile.completedJobs} job{profile.completedJobs !== 1 ? "s" : ""} completed
                </span>
              )}
            </div>
            {profile.availableDays?.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                <Calendar size={14} />
                <span>Available: {profile.availableDays.join(", ")}</span>
              </div>
            )}
            {profile.serviceAreas?.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                <MapPin size={14} />
                <span>Service areas: {profile.serviceAreas.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {(profile.portfolio?.length > 0 || isOwnProfile) && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <FolderOpen size={16} /> Portfolio
              {profile.portfolio?.length > 0 && (
                <span className="badge badge-ghost badge-sm ml-1">
                  {profile.portfolio.length} project{profile.portfolio.length !== 1 ? "s" : ""}
                </span>
              )}
              {isOwnProfile && (
                <Link to="/verification" className="btn btn-ghost btn-xs ml-auto gap-1 text-xs">
                  <Upload size={12} /> Manage
                </Link>
              )}
            </h3>
            {profile.portfolio?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.portfolio.map((item) => (
                  <div
                    key={item._id}
                    className="group relative rounded-xl overflow-hidden cursor-pointer bg-base-200 aspect-video"
                    onClick={() => setLightbox(item)}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-base-content/30 p-4">
                        <FolderOpen size={32} />
                        <span className="text-xs font-medium text-center leading-snug">{item.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3">
                      <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                      {item.description && (
                        <p className="text-white/70 text-xs mt-0.5 line-clamp-2 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-200">{item.description}</p>
                      )}
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="badge badge-xs bg-white/20 text-white border-white/20">{tag}</span>
                          ))}
                        </div>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-white/80 hover:text-white text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <ExternalLink size={11} /> View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : isOwnProfile ? (
              <div className="text-center py-8 space-y-2">
                <FolderOpen size={40} className="mx-auto text-base-content/20" />
                <p className="text-sm font-medium text-base-content/50">Showcase your work to attract more clients</p>
                <p className="text-xs text-base-content/40">Add projects with images and descriptions</p>
                <Link to="/verification" className="btn btn-primary btn-sm gap-2 mt-2">
                  <Upload size={14} /> Add First Project
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-base-100 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.imageUrl && (
              <img src={lightbox.imageUrl} alt={lightbox.title} className="w-full max-h-72 object-cover" />
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-lg leading-tight">{lightbox.title}</h3>
                <button className="btn btn-ghost btn-sm btn-circle shrink-0" onClick={() => setLightbox(null)}>
                  <X size={16} />
                </button>
              </div>
              {lightbox.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {lightbox.tags.map((tag, i) => (
                    <span key={i} className="badge badge-outline badge-sm">{tag}</span>
                  ))}
                </div>
              )}
              {lightbox.description && (
                <p className="text-sm text-base-content/70 leading-relaxed">{lightbox.description}</p>
              )}
              {lightbox.link && (
                <a href={lightbox.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm gap-2">
                  <ExternalLink size={14} /> View Project
                </a>
              )}
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
      {contracts.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <FileCheck size={20} className="text-primary" />
              Transaction History ({contracts.length})
            </h3>
            <div className="space-y-3">
              {contracts.map((c) => {
                const isHirerOnContract = c.hirer?._id === profileId;
                const otherParty = isHirerOnContract ? c.freelancer : c.hirer;
                const statusColor = {
                  completed: "badge-success",
                  active: "badge-info",
                  pending: "badge-warning",
                  cancelled: "badge-ghost",
                  disputed: "badge-error",
                }[c.status] || "badge-ghost";

                return (
                  <div
                    key={c._id}
                    className="border border-base-300 rounded-xl p-4 hover:bg-base-200/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm leading-tight line-clamp-1">
                        {c.title}
                      </h4>
                      <span className={`badge ${statusColor} badge-sm shrink-0 capitalize`}>
                        {c.status}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-base-content/60 line-clamp-2 mb-3">
                        {c.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <div className="avatar shrink-0">
                          <div className="w-6 rounded-full">
                            {c.hirer?.profilePhoto ? (
                              <img src={c.hirer.profilePhoto} alt={c.hirer.name} />
                            ) : (
                              <div className="bg-secondary text-secondary-content flex items-center justify-center w-full h-full text-[10px] font-bold rounded-full">
                                {c.hirer?.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/profile/${c.hirer?._id}`}
                            className="text-xs font-medium hover:text-primary transition-colors truncate block"
                          >
                            {c.hirer?.name}
                          </Link>
                          <span className="text-[10px] text-base-content/40 font-medium uppercase tracking-wider">
                            Hirer
                          </span>
                        </div>
                      </div>

                      <ArrowRight size={14} className="text-base-content/30 shrink-0" />

                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <div className="avatar shrink-0">
                          <div className="w-6 rounded-full">
                            {c.freelancer?.profilePhoto ? (
                              <img src={c.freelancer.profilePhoto} alt={c.freelancer.name} />
                            ) : (
                              <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-[10px] font-bold rounded-full">
                                {c.freelancer?.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/profile/${c.freelancer?._id}`}
                            className="text-xs font-medium hover:text-primary transition-colors truncate block"
                          >
                            {c.freelancer?.name}
                          </Link>
                          <span className="text-[10px] text-base-content/40 font-medium uppercase tracking-wider">
                            Freelancer
                          </span>
                        </div>
                      </div>
                    </div>
                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.skills.map((s, i) => (
                          <span key={i} className="badge badge-outline badge-xs py-1.5">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50">
                      {c.amount > 0 && (
                        <span className="flex items-center gap-1 font-medium text-base-content/70">
                          <DollarSign size={12} />
                          ₱{c.amount.toLocaleString()}
                          {c.rateType === "hourly" && "/hr"}
                        </span>
                      )}
                      {c.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(c.startDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      {c.completedAt && (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle size={11} />
                          Done {new Date(c.completedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      {c.rating?.averageScore && (
                        <span className="flex items-center gap-1 text-warning">
                          <Star size={11} fill="currentColor" />
                          {c.rating.averageScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {c.rating?.comment && (
                      <p className="text-xs text-base-content/60 mt-2 italic border-l-2 border-primary/30 pl-2">
                        "{c.rating.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
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

    {showContractModal && profile && (
      <ContractModal
        freelancer={profile}
        onClose={() => setShowContractModal(false)}
        onCreated={() => {
          // Refresh contracts
          contractAPI.getUserContracts(profile._id).then(r => setContracts(r.data.contracts)).catch(() => {});
        }}
      />
    )}
    </>
  );
}
