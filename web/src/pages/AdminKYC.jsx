import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import { Check, X, ZoomIn, ArrowLeft } from "lucide-react";

const BADGE_COLORS = { 0: "badge-ghost", 1: "badge-success", 2: "badge-info", 3: "badge-warning" };
const BADGE_LABELS = { 0: "Unverified", 1: "Hirer 🟢", 2: "Freelancer 🔵", 3: "Verified ⭐" };

// ── Individual document card ──────────────────────────────────────────────────
function DocCard({ label, url, idType, verified, onApprove, onReject, approving, rejecting }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [lightbox, setLightbox] = useState(false);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg border border-dashed border-base-300 bg-base-200/40 min-h-[10rem]">
        <span className="text-xs text-base-content/40">{label}</span>
        <span className="text-xs text-base-content/30">Not uploaded</span>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col gap-2 p-3 rounded-lg border bg-base-100 ${verified ? "border-success/50" : "border-base-300"}`}>
        <div
          className="relative cursor-zoom-in rounded overflow-hidden bg-base-200 h-36 group"
          onClick={() => setLightbox(true)}
        >
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={22} className="text-white drop-shadow-lg" />
          </div>
          {verified && (
            <div className="absolute top-1.5 right-1.5 badge badge-success badge-xs gap-0.5">
              <Check size={9} /> Approved
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">{label}</span>
          {idType && <span className="text-xs text-base-content/50">{idType}</span>}
        </div>
        {verified ? (
          <div className="flex items-center justify-center gap-1 py-1 text-xs text-success font-medium">
            <Check size={12} /> Approved
          </div>
        ) : (
          <>
            {rejectMode && (
              <textarea
                className="textarea textarea-bordered textarea-xs w-full"
                rows={2}
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
            )}
            {!rejectMode ? (
              <div className="flex gap-1.5">
                <button
                  className="btn btn-success btn-xs flex-1 gap-1"
                  disabled={approving}
                  onClick={onApprove}
                >
                  {approving
                    ? <span className="loading loading-spinner loading-xs" />
                    : <><Check size={11} /> Approve</>}
                </button>
                <button
                  className="btn btn-error btn-outline btn-xs flex-1 gap-1"
                  onClick={() => { setRejectMode(true); setReason(""); }}
                >
                  <X size={11} /> Reject
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button
                  className="btn btn-ghost btn-xs flex-1"
                  onClick={() => { setRejectMode(false); setReason(""); }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error btn-xs flex-1"
                  disabled={rejecting}
                  onClick={() => onReject(reason)}
                >
                  {rejecting
                    ? <span className="loading loading-spinner loading-xs" />
                    : "Confirm"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <img
            src={url}
            alt={label}
            className="max-w-[92vw] max-h-[92vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 btn btn-circle btn-sm bg-white/10 border-0 text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
          >
            <X size={16} />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {label}{idType ? ` — ${idType}` : ""}
          </p>
        </div>
      )}
    </>
  );
}

export default function AdminKYC() {
  const [searchParams] = useSearchParams();
  const filterUserId = searchParams.get("user");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingKYC = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingKYC(filterUserId ? { user: filterUserId } : undefined);
      setUsers(res.data.users);
    } catch { toast.error("Failed to load pending KYC"); }
    finally { setLoading(false); }
  }, [filterUserId]);

  useEffect(() => { fetchPendingKYC(); }, [fetchPendingKYC]);

  const handleApproveGovId = async (userId) => {
    setActionLoading(userId + "_gov_approve");
    try {
      await adminAPI.approveGovernmentId(userId);
      toast.success("Government ID approved");
      fetchPendingKYC();
    } catch (err) { toast.error(err.response?.data?.message || "Approval failed"); }
    finally { setActionLoading(null); }
  };

  const handleRejectGovId = async (userId, reason) => {
    setActionLoading(userId + "_gov_reject");
    try {
      await adminAPI.rejectGovernmentId(userId, reason);
      toast.success("Government ID rejected");
      fetchPendingKYC();
    } catch (err) { toast.error(err.response?.data?.message || "Rejection failed"); }
    finally { setActionLoading(null); }
  };

  const handleApproveSelfie = async (userId) => {
    setActionLoading(userId + "_selfie_approve");
    try {
      await adminAPI.approveSelfie(userId);
      toast.success("Selfie approved");
      fetchPendingKYC();
    } catch (err) { toast.error(err.response?.data?.message || "Approval failed"); }
    finally { setActionLoading(null); }
  };

  const handleRejectSelfie = async (userId, reason) => {
    setActionLoading(userId + "_selfie_reject");
    try {
      await adminAPI.rejectSelfie(userId, reason);
      toast.success("Selfie rejected");
      fetchPendingKYC();
    } catch (err) { toast.error(err.response?.data?.message || "Rejection failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        {filterUserId && (
          <Link to="/admin/kyc" className="btn btn-ghost btn-xs gap-1 mb-2">
            <ArrowLeft size={14} /> Back to all pending
          </Link>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight">KYC Review</h1>
        <p className="text-base-content/50 text-sm">
          {filterUserId ? "Reviewing documents for selected user" : "Review government ID and selfie submissions individually"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : users.length === 0 ? (
        <div className="card border border-base-300 p-10 text-center text-base-content/40">
          <Check size={36} className="mx-auto mb-2 text-success" />
          <p className="font-medium">No pending KYC submissions</p>
          <p className="text-sm">All documents have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {users.map((u) => (
            <div key={u._id} className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-base-300 flex-shrink-0">
                      {u.profilePhoto && <img src={u.profilePhoto} alt={u.name} />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-base-content/50 truncate">{u.email}</p>
                  </div>
                  <span className={`badge ${BADGE_COLORS[u.badgeLevel]} badge-sm flex-shrink-0`}>
                    {BADGE_LABELS[u.badgeLevel]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <DocCard
                    label="Government ID"
                    url={u.governmentId?.url}
                    idType={u.governmentId?.type}
                    verified={u.governmentId?.verified}
                    onApprove={() => handleApproveGovId(u._id)}
                    onReject={(reason) => handleRejectGovId(u._id, reason)}
                    approving={actionLoading === u._id + "_gov_approve"}
                    rejecting={actionLoading === u._id + "_gov_reject"}
                  />
                  <DocCard
                    label="Selfie"
                    url={u.selfieUrl}
                    verified={u.selfieVerified}
                    onApprove={() => handleApproveSelfie(u._id)}
                    onReject={(reason) => handleRejectSelfie(u._id, reason)}
                    approving={actionLoading === u._id + "_selfie_approve"}
                    rejecting={actionLoading === u._id + "_selfie_reject"}
                  />
                </div>

                <p className="text-xs text-base-content/40 text-right">
                  Submitted {new Date(u.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
