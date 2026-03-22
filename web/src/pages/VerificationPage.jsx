import { useState, useEffect, useRef } from "react";
import { verificationAPI, userAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Shield, ShieldCheck, Briefcase, Star,
  Mail, CreditCard, Camera, FileText,
  FolderOpen, ScrollText, Check, ChevronRight,
  Upload, Trash2, ExternalLink, Loader2, Pencil,
  Lock, AlertTriangle, Clock,
} from "lucide-react";
import { BadgeCard } from "../components/badge/BadgeSystem";

const LEVEL_META = [
  { level: 1, label: "Hirer", emoji: "🟢", color: "text-success", accent: "success", description: "Unlock messaging, AI assistant & comments" },
  { level: 2, label: "Freelancer", emoji: "🔵", color: "text-info", accent: "info", description: "Post reels, get matched with clients & full access" },
  { level: 3, label: "Verified Freelancer", emoji: "⭐", color: "text-warning", accent: "warning", description: "Verified badge, priority in search results" },
];

export default function VerificationPage() {
  const { user, updateUser } = useAuthStore();
  const [checklist, setChecklist] = useState(null);
  const [badgeLevel, setBadgeLevel] = useState(user?.badgeLevel || 0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [kycStatus, setKycStatus] = useState("");
  const [kycRejectedReason, setKycRejectedReason] = useState("");
  const [governmentIdUploaded, setGovernmentIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [clearanceStatus, setClearanceStatus] = useState("");
  const [clearanceRejectedReason, setClearanceRejectedReason] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  // File input refs
  const govIdRef = useRef(null);
  const selfieRef = useRef(null);
  const clearanceRef = useRef(null);
  const portfolioImageRef = useRef(null);

  // Portfolio form
  const [portfolioForm, setPortfolioForm] = useState({ title: "", description: "", link: "", tags: "" });
  const [portfolioImage, setPortfolioImage] = useState(null);
  const [portfolioImagePreview, setPortfolioImagePreview] = useState(null);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Email OTP flow
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");


  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await verificationAPI.getStatus();
      setChecklist(res.data.checklist);
      setBadgeLevel(res.data.badgeLevel);
      setKycStatus(res.data.kycStatus || "");
      setKycRejectedReason(res.data.kycRejectedReason || "");
      setGovernmentIdUploaded(res.data.governmentIdUploaded || false);
      setSelfieUploaded(res.data.selfieUploaded || false);
      setClearanceStatus(res.data.clearanceStatus || "");
      setClearanceRejectedReason(res.data.clearanceRejectedReason || "");
    } catch {
      toast.error("Failed to load verification status");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await userAPI.getProfile(user._id);
      updateUser(res.data);
    } catch { /* best effort */ }
  };

  const handleSendEmailOtp = async () => {
    setSubmitting("emailSend");
    try {
      const res = await verificationAPI.sendEmailOtp();
      toast.success(res.data.message || "OTP sent to your email!");
      setEmailOtpSent(true);
      setEmailOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSubmitting(null);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) return toast.error("Enter the OTP from your email");
    setSubmitting("emailVerified");
    try {
      const res = await verificationAPI.verifyEmailOtp(emailOtp);
      toast.success("Email verified!");
      setBadgeLevel(res.data.badgeLevel);
      setEmailOtpSent(false);
      setEmailOtp("");
      await fetchStatus();
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setSubmitting(null);
    }
  };

  const handleUpload = async (key, apiCall, ref) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    setSubmitting(key);
    try {
      const fd = new FormData();
      fd.append(key === "governmentId" ? "governmentId" : key === "selfie" ? "selfie" : "clearance", file);
      await apiCall(fd);
      toast.success("Document uploaded! Awaiting admin review.");
      if (key === "governmentId") setGovernmentIdUploaded(true);
      if (key === "selfie") setSelfieUploaded(true);
      await fetchStatus();
      await refreshUser();
    } catch {
      toast.error("Upload failed");
    } finally {
      setSubmitting(null);
      if (ref.current) ref.current.value = "";
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!portfolioForm.title) return toast.error("Title is required");
    setSubmitting("portfolio");
    try {
      const fd = new FormData();
      fd.append("title", portfolioForm.title);
      fd.append("description", portfolioForm.description);
      fd.append("link", portfolioForm.link);
      fd.append("tags", portfolioForm.tags);
      if (portfolioImage) fd.append("portfolioImage", portfolioImage);
      const res = await verificationAPI.addPortfolio(fd);
      toast.success("Portfolio item added!");
      setBadgeLevel(res.data.badgeLevel);
      setPortfolioForm({ title: "", description: "", link: "", tags: "" });
      setPortfolioImage(null);
      setPortfolioImagePreview(null);
      setShowPortfolioForm(false);
      await fetchStatus();
      await refreshUser();
    } catch {
      toast.error("Failed to add portfolio item");
    } finally {
      setSubmitting(null);
    }
  };

  const handleRemovePortfolio = async (itemId) => {
    try {
      await verificationAPI.removePortfolio(itemId);
      toast.success("Removed");
      await fetchStatus();
      await refreshUser();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleEditPortfolio = (item) => {
    setEditingItem(item);
    setPortfolioForm({
      title: item.title,
      description: item.description || "",
      link: item.link || "",
      tags: item.tags?.join(", ") || "",
    });
    setPortfolioImage(null);
    setPortfolioImagePreview(null);
    setShowPortfolioForm(true);
  };

  const handleUpdatePortfolio = async (e) => {
    e.preventDefault();
    if (!portfolioForm.title) return toast.error("Title is required");
    setSubmitting("portfolio");
    try {
      const fd = new FormData();
      fd.append("title", portfolioForm.title);
      fd.append("description", portfolioForm.description);
      fd.append("link", portfolioForm.link);
      fd.append("tags", portfolioForm.tags);
      if (portfolioImage) fd.append("portfolioImage", portfolioImage);
      await verificationAPI.updatePortfolio(editingItem._id, fd);
      toast.success("Portfolio item updated!");
      setPortfolioForm({ title: "", description: "", link: "", tags: "" });
      setPortfolioImage(null);
      setPortfolioImagePreview(null);
      setEditingItem(null);
      setShowPortfolioForm(false);
      await fetchStatus();
      await refreshUser();
    } catch {
      toast.error("Failed to update portfolio item");
    } finally {
      setSubmitting(null);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitting("resume");
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await userAPI.uploadResume(fd);
      const skillCount = res.data.extractedData?.skills?.length || 0;
      toast.success(
        skillCount > 0
          ? `Resume uploaded! ${skillCount} skill${skillCount > 1 ? "s" : ""} auto-extracted.`
          : "Resume uploaded!"
      );
      updateUser(res.data.user);
      await fetchStatus();
    } catch {
      toast.error("Upload failed");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Verification Center</h1>
        <p className="text-base-content/60">Complete steps to unlock platform features</p>
      </div>
      {!agreedToTerms && (
        <div className="card border-2 border-primary/40 bg-primary/5 shadow-lg">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Data Privacy Consent</h2>
                <p className="text-xs text-base-content/50">Required before proceeding with verification</p>
              </div>
            </div>
            <div className="divider my-0" />
            <div className="bg-base-100 rounded-xl border border-base-300 p-4 max-h-[calc(100vh-22rem)] overflow-y-auto text-sm space-y-4 leading-relaxed scrollbar-thin">
              <p className="font-bold text-base text-center">TERMS AND CONDITIONS &amp; DATA PRIVACY NOTICE</p>
              <p className="text-base-content/70 text-center text-xs">GaLink Platform — Verification Center<br />In accordance with Republic Act No. 10173 (Data Privacy Act of 2012)</p>

              <div>
                <p className="font-semibold mb-1">1. Purpose of Data Collection</p>
                <p className="text-base-content/70">GaLink collects personal information — including your government-issued identification, selfie photo, and National Police Clearance — solely for the purpose of verifying your identity and eligibility to use the platform. This helps us maintain a safe and trustworthy community for hirers and freelancers in the Philippines.</p>
              </div>

              <div>
                <p className="font-semibold mb-1">2. Legal Basis</p>
                <p className="text-base-content/70">The processing of your personal data is governed by <strong>Republic Act No. 10173</strong>, the Data Privacy Act of 2012, and its Implementing Rules and Regulations (IRR) issued by the National Privacy Commission (NPC). By proceeding, you give your free, specific, informed, and unambiguous consent to the collection and processing of your personal data as described herein.</p>
              </div>

              <div>
                <p className="font-semibold mb-1">3. Data Collected</p>
                <ul className="list-disc list-inside text-base-content/70 space-y-1">
                  <li>Full name, email address, and profile information</li>
                  <li>Government-issued ID (e.g., PhilSys, UMID, Passport, Driver's License)</li>
                  <li>Selfie photo for identity matching</li>
                  <li>National Police Clearance or NBI Clearance</li>
                  <li>Portfolio items and resume/CV (for freelancer verification)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-1">4. How Your Data Is Used</p>
                <ul className="list-disc list-inside text-base-content/70 space-y-1">
                  <li>To verify your identity and award the appropriate badge level</li>
                  <li>To prevent fraud, impersonation, and misuse of the platform</li>
                  <li>To comply with applicable Philippine laws and regulations</li>
                  <li>Data is <strong>not</strong> sold to third parties</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-1">5. Data Retention</p>
                <p className="text-base-content/70">Your verification documents are retained for a minimum of <strong>one (1) year</strong> from the date of submission, or as required by applicable law. After this period, documents will be securely deleted unless retention is otherwise required.</p>
              </div>

              <div>
                <p className="font-semibold mb-1">6. Data Security</p>
                <p className="text-base-content/70">GaLink implements appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction, in accordance with Section 20 of RA 10173.</p>
              </div>

              <div>
                <p className="font-semibold mb-1">7. Your Rights Under RA 10173</p>
                <p className="text-base-content/70 mb-1">As a data subject, you have the right to:</p>
                <ul className="list-disc list-inside text-base-content/70 space-y-1">
                  <li><strong>Be informed</strong> — know what data we collect and how it is used</li>
                  <li><strong>Access</strong> — request a copy of your personal data</li>
                  <li><strong>Rectification</strong> — correct inaccurate or outdated information</li>
                  <li><strong>Erasure / Blocking</strong> — request deletion of your data under certain conditions</li>
                  <li><strong>Object</strong> — oppose the processing of your data in certain circumstances</li>
                  <li><strong>Data Portability</strong> — receive your data in a commonly used format</li>
                  <li><strong>Lodge a complaint</strong> — file a complaint with the National Privacy Commission (NPC) at <em>privacy.gov.ph</em></li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-1">8. Third-Party Services</p>
                <p className="text-base-content/70">Document uploads are stored using Cloudinary, a cloud storage provider with industry-standard security practices. AI-assisted features use OpenAI's API; no personally identifiable verification documents are shared with AI services.</p>
              </div>

              <div>
                <p className="font-semibold mb-1">9. Consent is Voluntary</p>
                <p className="text-base-content/70">Providing your consent is voluntary. However, without completing verification, certain platform features (messaging, posting reels, matching) will remain locked as described in the badge system.</p>
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-base-content/70"><strong>Important:</strong> By clicking "I Agree and Proceed", you acknowledge that you have read, understood, and voluntarily consent to the collection and processing of your personal data as described above, in accordance with RA 10173 and its IRR.</p>
                </div>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mt-0.5 flex-shrink-0"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
              />
              <span className="text-sm text-base-content/80 group-hover:text-base-content transition-colors">
                I have read and understood the Data Privacy Notice above. I voluntarily consent to the collection and processing of my personal data in accordance with <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong>.
              </span>
            </label>
            <button
              className="btn btn-primary w-full gap-2"
              disabled={!termsChecked}
              onClick={() => setAgreedToTerms(true)}
            >
              <ShieldCheck size={18} />
              I Agree and Proceed to Verification
            </button>
          </div>
        </div>
      )}
      {agreedToTerms && (<>
      <BadgeCard level={badgeLevel} />
      <div className="flex items-center gap-1 px-2">
        {[0, 1, 2, 3].map((lvl) => (
          <div key={lvl} className="flex-1 flex items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              badgeLevel >= lvl
                ? lvl === 3 ? "bg-warning text-warning-content border-warning" : lvl === 2 ? "bg-info text-info-content border-info" : lvl === 1 ? "bg-success text-success-content border-success" : "bg-primary text-primary-content border-primary"
                : "bg-base-200 text-base-content/40 border-base-300"
            }`}>
              {badgeLevel >= lvl ? <Check size={14} /> : lvl}
            </div>
            {lvl < 3 && (
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${badgeLevel > lvl ? "bg-primary" : "bg-base-300"}`} />
            )}
          </div>
        ))}
      </div>
      {LEVEL_META.map(({ level, label, emoji, color, accent, description }) => {
        const section = checklist?.[`level${level}`];
        if (!section) return null;
        const allDone = section.items.every((it) => it.done);
        const isUnlocked = badgeLevel >= level;
        const isNext = badgeLevel === level - 1;

        return (
          <div
            key={level}
            className={`card border transition-all duration-300 ${
              isUnlocked
                ? `border-${accent}/40 bg-gradient-to-br from-${accent}/5 to-transparent`
                : isNext
                ? "border-base-300 shadow-lg"
                : "border-base-300 opacity-60"
            }`}
          >
            <div className="card-body p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUnlocked ? `bg-${accent}/20 ${color}` : "bg-base-200 text-base-content/40"}`}>
                  {level === 1 ? <ShieldCheck size={20} /> : level === 2 ? <Briefcase size={20} /> : <Star size={20} />}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    Level {level} — {label} <span>{emoji}</span>
                    {isUnlocked && <span className={`badge badge-${accent} badge-sm`}>Unlocked</span>}
                  </h2>
                  <p className="text-xs text-base-content/50">{description}</p>
                </div>
                {allDone && <Check className={color} size={22} />}
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                      item.done ? "bg-success/8" : "bg-base-200/60 hover:bg-base-200"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? "bg-success text-success-content" : "border-2 border-base-300"
                    }`}>
                      {item.done && <Check size={12} />}
                    </div>
                    <span className={`flex-1 text-sm ${item.done ? "line-through text-base-content/40" : "font-medium"}`}>
                      {item.label}
                    </span>
                    {!item.done && renderAction(item.key)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {badgeLevel >= 1 && (
        <div className="card border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <FolderOpen size={18} /> Portfolio
                {user?.portfolio?.length > 0 && (
                  <span className="badge badge-ghost badge-sm">{user.portfolio.length}</span>
                )}
              </h3>
              <button
                className="btn btn-primary btn-sm gap-1"
                onClick={() => {
                  if (showPortfolioForm) {
                    setEditingItem(null);
                    setPortfolioImagePreview(null);
                    setPortfolioForm({ title: "", description: "", link: "", tags: "" });
                  }
                  setShowPortfolioForm(!showPortfolioForm);
                }}
              >
                {showPortfolioForm ? "Cancel" : "+ Add Item"}
              </button>
            </div>

            {showPortfolioForm && (
              <form onSubmit={editingItem ? handleUpdatePortfolio : handleAddPortfolio} className="space-y-3 mb-4 bg-base-200/50 rounded-xl p-4">
                {editingItem && (
                  <p className="text-xs text-primary font-semibold flex items-center gap-1">
                    <Pencil size={12} /> Editing: {editingItem.title}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Project title *"
                  className="input input-bordered w-full input-sm"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                />
                <textarea
                  placeholder="Brief description"
                  className="textarea textarea-bordered w-full textarea-sm"
                  rows={2}
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="Project link (optional)"
                  className="input input-bordered w-full input-sm"
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tags: Web, Design, Branding (optional, comma-separated)"
                  className="input input-bordered w-full input-sm"
                  value={portfolioForm.tags}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, tags: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <label className="btn btn-ghost btn-sm gap-1">
                    <Upload size={14} /> Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={portfolioImageRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPortfolioImage(file);
                        setPortfolioImagePreview(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                  </label>
                  {portfolioImagePreview ? (
                    <img src={portfolioImagePreview} alt="preview" className="h-10 w-16 object-cover rounded-lg" />
                  ) : editingItem?.imageUrl ? (
                    <img src={editingItem.imageUrl} alt="current" className="h-10 w-16 object-cover rounded-lg opacity-60" />
                  ) : portfolioImage ? (
                    <span className="text-xs text-base-content/60">{portfolioImage.name}</span>
                  ) : null}
                  <button type="submit" className="btn btn-primary btn-sm ml-auto gap-1" disabled={submitting === "portfolio"}>
                    {submitting === "portfolio" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : editingItem ? (
                      <><Pencil size={13} /> Save Changes</>
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              </form>
            )}

            {user?.portfolio?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.portfolio.map((item) => (
                  <div
                    key={item._id}
                    className={`group relative rounded-xl overflow-hidden bg-base-200 aspect-video ${editingItem?._id === item._id ? "ring-2 ring-primary" : ""}`}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-base-content/30 p-4">
                        <FolderOpen size={28} />
                        <span className="text-xs font-medium text-center leading-snug">{item.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3">
                      <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="badge badge-xs bg-white/20 text-white border-0">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="btn btn-xs btn-ghost bg-black/50 text-white hover:bg-black/70"
                        onClick={() => handleEditPortfolio(item)}
                        title="Edit"
                      >
                        <Pencil size={11} />
                      </button>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-xs btn-ghost bg-black/50 text-white hover:bg-black/70"
                          title="View project"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <button
                        className="btn btn-xs btn-ghost bg-black/50 text-error hover:bg-black/70"
                        onClick={() => handleRemovePortfolio(item._id)}
                        title="Remove"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/50 text-center py-4">
                No portfolio items yet. Add projects to showcase your work to clients!
              </p>
            )}
          </div>
        </div>
      )}
      </>)}
    </div>
  );

  // ── Render action buttons per checklist key ────────────────────
  function renderAction(key) {
    const isLoading = submitting === key;
    const btnClass = "btn btn-sm btn-primary gap-1";

    switch (key) {
      case "emailVerified":
        return emailOtpSent ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              className="input input-bordered input-sm w-28 tracking-widest text-center font-mono"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <button className={btnClass} onClick={handleVerifyEmailOtp} disabled={submitting === "emailVerified"}>
              {submitting === "emailVerified" ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Confirm</>}
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={handleSendEmailOtp}
              disabled={submitting === "emailSend"}
            >
              Resend
            </button>
          </div>
        ) : (
          <button className={btnClass} onClick={handleSendEmailOtp} disabled={submitting === "emailSend"}>
            {submitting === "emailSend" ? <Loader2 size={14} className="animate-spin" /> : <><Mail size={14} /> Send OTP</>}
          </button>
        );
      case "governmentId":
        if (governmentIdUploaded) {
          return <span className="badge badge-warning gap-1"><Clock size={12} /> Pending Approval</span>;
        }
        if (kycStatus === "rejected" && !governmentIdUploaded) {
          return (
            <div className="flex flex-col items-end gap-1">
              <span className="badge badge-error badge-sm">Rejected{kycRejectedReason ? `: ${kycRejectedReason}` : ""}</span>
              <>
                <input type="file" accept="image/*,.pdf" ref={govIdRef} className="hidden"
                  onChange={() => handleUpload("governmentId", verificationAPI.uploadGovernmentId, govIdRef)} />
                <button className={`${btnClass} btn-sm`} onClick={() => govIdRef.current?.click()} disabled={submitting === "governmentId"}>
                  {submitting === "governmentId" ? <Loader2 size={14} className="animate-spin" /> : <><CreditCard size={14} /> Re-upload</>}
                </button>
              </>
            </div>
          );
        }
        return (
          <>
            <input type="file" accept="image/*,.pdf" ref={govIdRef} className="hidden"
              onChange={() => handleUpload("governmentId", verificationAPI.uploadGovernmentId, govIdRef)} />
            <button className={btnClass} onClick={() => govIdRef.current?.click()} disabled={submitting === "governmentId"}>
              {submitting === "governmentId" ? <Loader2 size={14} className="animate-spin" /> : <><CreditCard size={14} /> Upload ID</>}
            </button>
          </>
        );
      case "selfie":
        if (selfieUploaded) {
          return <span className="badge badge-warning gap-1"><Clock size={12} /> Pending Approval</span>;
        }
        if (kycStatus === "rejected" && !selfieUploaded) {
          return (
            <div className="flex flex-col items-end gap-1">
              <span className="badge badge-error badge-sm">Rejected</span>
              <>
                <input type="file" accept="image/*" capture="user" ref={selfieRef} className="hidden"
                  onChange={() => handleUpload("selfie", verificationAPI.uploadSelfie, selfieRef)} />
                <button className={`${btnClass} btn-sm`} onClick={() => selfieRef.current?.click()} disabled={submitting === "selfie"}>
                  {submitting === "selfie" ? <Loader2 size={14} className="animate-spin" /> : <><Camera size={14} /> Re-take Selfie</>}
                </button>
              </>
            </div>
          );
        }
        return (
          <>
            <input type="file" accept="image/*" capture="user" ref={selfieRef} className="hidden"
              onChange={() => handleUpload("selfie", verificationAPI.uploadSelfie, selfieRef)} />
            <button className={btnClass} onClick={() => selfieRef.current?.click()} disabled={submitting === "selfie"}>
              {submitting === "selfie" ? <Loader2 size={14} className="animate-spin" /> : <><Camera size={14} /> Take Selfie</>}
            </button>
          </>
        );
      case "resume":
        return (
          <>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={handleResumeUpload} ref={(el) => { if (el) el._resumeRef = el; }}
              id="resume-upload-verify" />
            <label htmlFor="resume-upload-verify" className={`${btnClass} cursor-pointer`}>
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><FileText size={14} /> Upload</>}
            </label>
          </>
        );
      case "portfolio":
        return (
          <button className="btn btn-sm btn-ghost gap-1" onClick={() => setShowPortfolioForm(true)}>
            <ChevronRight size={14} /> Add Below
          </button>
        );
      case "clearance":
        if (clearanceStatus === "pending") {
          return (
            <span className="badge badge-warning gap-1"><Clock size={12} /> Awaiting Review</span>
          );
        }
        if (clearanceStatus === "rejected") {
          return (
            <div className="flex flex-col items-end gap-1">
              <span className="badge badge-error badge-sm">Rejected{clearanceRejectedReason ? `: ${clearanceRejectedReason}` : ""}</span>
              <>
                <input type="file" accept="image/*,.pdf" ref={clearanceRef} className="hidden"
                  onChange={() => handleUpload("clearance", verificationAPI.uploadClearance, clearanceRef)} />
                <button className={`${btnClass} btn-sm`} onClick={() => clearanceRef.current?.click()} disabled={submitting === "clearance"}>
                  {submitting === "clearance" ? <Loader2 size={14} className="animate-spin" /> : <><ScrollText size={14} /> Re-upload</>}
                </button>
              </>
            </div>
          );
        }
        return (
          <>
            <input type="file" accept="image/*,.pdf" ref={clearanceRef} className="hidden"
              onChange={() => handleUpload("clearance", verificationAPI.uploadClearance, clearanceRef)} />
            <button className={btnClass} onClick={() => clearanceRef.current?.click()} disabled={submitting === "clearance"}>
              {submitting === "clearance" ? <Loader2 size={14} className="animate-spin" /> : <><ScrollText size={14} /> Upload</>}
            </button>
          </>
        );
      case "rating":
        return <span className="text-xs text-base-content/50 italic">Earned organically</span>;
      default:
        return null;
    }
  }
}
