import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Check, X, ExternalLink, AlertTriangle,
} from "lucide-react";

const BADGE_COLORS = { 0: "badge-ghost", 1: "badge-success", 2: "badge-info", 3: "badge-warning" };
const BADGE_LABELS = { 0: "Unverified", 1: "Hirer 🟢", 2: "Freelancer 🔵", 3: "Verified ⭐" };

export default function AdminClearances() {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchClearances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingClearances();
      setClearances(res.data.users);
    } catch { toast.error("Failed to load clearances"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClearances(); }, [fetchClearances]);

  const handleApprove = async (userId) => {
    setActionLoading(userId + "_approve");
    try {
      const res = await adminAPI.approveClearance(userId);
      toast.success(`Clearance approved — Level ${res.data.badgeLevel}`);
      fetchClearances();
    } catch (err) { toast.error(err.response?.data?.message || "Approval failed"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.userId + "_reject");
    try {
      await adminAPI.rejectClearance(rejectModal.userId, rejectReason);
      toast.success("Clearance rejected");
      setRejectModal(null);
      setRejectReason("");
      fetchClearances();
    } catch (err) { toast.error(err.response?.data?.message || "Rejection failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Clearance Review</h1>
        <p className="text-base-content/50 text-sm">Approve or reject submitted clearance documents</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : clearances.length === 0 ? (
        <div className="card border border-base-300 p-10 text-center text-base-content/40">
          <Check size={36} className="mx-auto mb-2 text-success" />
          <p className="font-medium">No pending clearances</p>
          <p className="text-sm">All submitted clearances have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clearances.map((u) => (
            <div key={u._id} className="card border border-warning/40 bg-warning/5 shadow-sm">
              <div className="card-body p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-base-300">
                      {u.profilePhoto && <img src={u.profilePhoto} alt={u.name} />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-base-content/50">{u.email}</p>
                  </div>
                  <span className={`badge ${BADGE_COLORS[u.badgeLevel]} badge-sm`}>
                    {BADGE_LABELS[u.badgeLevel]}
                  </span>
                </div>

                <div className="bg-base-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Type:</span>
                    <span className="font-medium">{u.clearance?.type || "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Uploaded:</span>
                    <span className="font-medium">
                      {u.clearance?.uploadedAt
                        ? new Date(u.clearance.uploadedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                        : "Unknown"}
                    </span>
                  </div>
                  {u.clearance?.url && !u.clearance.url.startsWith("admin:") && (
                    <a
                      href={u.clearance.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-xs gap-1 w-full"
                    >
                      <ExternalLink size={12} /> View Document
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-success btn-sm flex-1 gap-1"
                    disabled={actionLoading === u._id + "_approve"}
                    onClick={() => handleApprove(u._id)}
                  >
                    {actionLoading === u._id + "_approve"
                      ? <span className="loading loading-spinner loading-xs" />
                      : <><Check size={14} /> Approve</>}
                  </button>
                  <button
                    className="btn btn-error btn-outline btn-sm flex-1 gap-1"
                    onClick={() => { setRejectModal({ userId: u._id, userName: u.name }); setRejectReason(""); }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRejectModal(null)}>
          <div className="card bg-base-100 shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="card-body p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertTriangle size={18} className="text-error" /> Reject Clearance
              </h3>
              <p className="text-sm text-base-content/70">
                Rejecting clearance for <strong>{rejectModal.userName}</strong>. Provide a reason:
              </p>
              <textarea
                className="textarea textarea-bordered w-full textarea-sm"
                rows={3}
                placeholder="e.g. Document is blurry, expired, or not identifiable"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm flex-1" onClick={() => setRejectModal(null)}>Cancel</button>
                <button
                  className="btn btn-error btn-sm flex-1"
                  disabled={actionLoading === rejectModal.userId + "_reject"}
                  onClick={handleReject}
                >
                  {actionLoading === rejectModal.userId + "_reject"
                    ? <span className="loading loading-spinner loading-xs" />
                    : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
