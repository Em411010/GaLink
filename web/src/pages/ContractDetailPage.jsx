import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { contractAPI, ratingAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  FileText, CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight,
  Star, DollarSign, Calendar, Tag, Loader2, ChevronLeft, Ban, Edit3, Printer,
  PenLine, Send,
} from "lucide-react";
import ContractModal from "../components/contract/ContractModal";
import ContractPrintModal from "../components/contract/ContractPrintModal";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "badge-warning", icon: Clock },
  active: { label: "Active", color: "badge-info", icon: CheckCircle },
  completed: { label: "Completed", color: "badge-success", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "badge-ghost", icon: XCircle },
  disputed: { label: "Disputed", color: "badge-error", icon: AlertTriangle },
};

const STEPS = ["pending", "active", "completed"];

export default function ContractDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingForm, setRatingForm] = useState({ workQuality: 5, communication: 5, reliability: 5, comment: "" });
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [modifyFields, setModifyFields] = useState([]);
  const [modifyNotes, setModifyNotes] = useState("");
  const [modifyLoading, setModifyLoading] = useState(false);

  const fetchContract = async () => {
    try {
      const res = await contractAPI.getById(id);
      setContract(res.data.contract);
    } catch {
      toast.error("Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContract(); }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (!contract) return <div className="text-center py-12">Contract not found</div>;

  const isHirer = user?._id === contract.hirer?._id;
  const isFreelancer = user?._id === contract.freelancer?._id;
  const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  const doAction = async (action) => {
    setActionLoading(true);
    try {
      let res;
      if (action === "accept") res = await contractAPI.acceptContract(id);
      else if (action === "decline") res = await contractAPI.declineContract(id);
      else if (action === "dispute") res = await contractAPI.updateStatus(id, "disputed", { disputeReason });
      else res = await contractAPI.updateStatus(id, action);
      setContract(res.data.contract);
      setShowDispute(false);
      toast.success(`Contract ${action === "accept" ? "accepted" : action === "decline" ? "declined" : action}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const submitModificationRequest = async () => {
    if (modifyFields.length === 0 && !modifyNotes.trim()) {
      toast.error("Select at least one field or add notes");
      return;
    }
    setModifyLoading(true);
    try {
      const res = await contractAPI.requestModification(id, { fields: modifyFields, notes: modifyNotes });
      setContract(res.data.contract);
      setShowModifyForm(false);
      setModifyFields([]);
      setModifyNotes("");
      toast.success("Modification request sent to hirer!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setModifyLoading(false);
    }
  };

  const submitRating = async () => {
    setActionLoading(true);
    try {
      await ratingAPI.createRating(contract.freelancer._id, { ...ratingForm, contractId: contract._id });
      toast.success("Rating submitted!");
      setShowRating(false);
      fetchContract();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setActionLoading(false);
    }
  };

  // Timeline step index
  const currentStep = contract.status === "cancelled" || contract.status === "disputed"
    ? (contract.completedAt ? 2 : contract.status === "active" ? 1 : 0)
    : STEPS.indexOf(contract.status);

  const PartyCard = ({ party, role }) => (
    <Link to={`/profile/${party?._id}`} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors flex-1">
      <div className="avatar">
        <div className="w-10 rounded-full">
          {party?.profilePhoto ? (
            <img src={party.profilePhoto} alt={party.name} />
          ) : (
            <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center font-bold rounded-full">
              {party?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm">{party?.name}</p>
        <p className="text-xs text-base-content/50">{role}</p>
      </div>
    </Link>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/contracts" className="btn btn-ghost btn-sm gap-1">
          <ChevronLeft size={16} /> Back to Contracts
        </Link>
        <button onClick={() => setShowPrint(true)} className="btn btn-ghost btn-sm gap-1">
          <Printer size={15} /> Print / PDF
        </button>
      </div>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{contract.title}</h2>
              {contract.description && (
                <p className="text-sm text-base-content/60 mt-1">{contract.description}</p>
              )}
            </div>
            <span className={`badge ${cfg.color} gap-1`}>
              <StatusIcon size={12} /> {cfg.label}
            </span>
          </div>
          <div className="flex items-center mt-4 mb-2">
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      done ? "bg-primary text-primary-content border-primary" : "bg-base-100 border-base-300 text-base-content/40"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                      {done ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className={`text-[10px] whitespace-nowrap ${done ? "text-primary font-semibold" : "text-base-content/40"}`}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < currentStep ? "bg-primary" : "bg-base-300"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {(contract.status === "cancelled" || contract.status === "disputed") && (
            <div className={`alert ${contract.status === "disputed" ? "alert-error" : "alert-warning"} py-2 text-sm mt-2`}>
              <StatusIcon size={16} />
              <span>
                {contract.status === "disputed"
                  ? `Disputed${contract.disputeReason ? `: ${contract.disputeReason}` : ""}`
                  : `Cancelled${contract.declinedAt ? " (Declined by freelancer)" : ""}`}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <PartyCard party={contract.hirer} role="Hirer" />
        <div className="flex items-center"><ArrowRight size={18} className="text-base-content/30" /></div>
        <PartyCard party={contract.freelancer} role="Freelancer" />
      </div>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-3">
          {contract.skills?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-base-content/50 mb-1 flex items-center gap-1"><Tag size={11} /> Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {contract.skills.map((s, i) => (
                  <span key={i} className="badge badge-primary badge-outline badge-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {contract.amount > 0 && (
              <div>
                <h4 className="text-xs font-medium text-base-content/50 flex items-center gap-1"><DollarSign size={11} /> Amount</h4>
                <p className="font-semibold text-sm">₱{contract.amount.toLocaleString()}{contract.rateType === "hourly" ? "/hr" : ""}</p>
              </div>
            )}
            {contract.startDate && (
              <div>
                <h4 className="text-xs font-medium text-base-content/50 flex items-center gap-1"><Calendar size={11} /> Start</h4>
                <p className="text-sm">{new Date(contract.startDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            )}
            {contract.endDate && (
              <div>
                <h4 className="text-xs font-medium text-base-content/50 flex items-center gap-1"><Calendar size={11} /> End</h4>
                <p className="text-sm">{new Date(contract.endDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            )}
            {contract.completedAt && (
              <div>
                <h4 className="text-xs font-medium text-base-content/50 flex items-center gap-1"><CheckCircle size={11} /> Completed</h4>
                <p className="text-sm text-success">{new Date(contract.completedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            )}
          </div>
          {contract.rating && (
            <div className="bg-base-200/50 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <Star size={14} className="text-warning" fill="currentColor" />
                <span className="font-semibold text-sm">{contract.rating.averageScore?.toFixed(1)}</span>
                <span className="text-xs text-base-content/50">
                  (Quality: {contract.rating.workQuality} · Communication: {contract.rating.communication} · Reliability: {contract.rating.reliability})
                </span>
              </div>
              {contract.rating.comment && (
                <p className="text-sm text-base-content/70 italic">"{contract.rating.comment}"</p>
              )}
            </div>
          )}
        </div>
      </div>
      {(isHirer || isFreelancer) && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold text-sm mb-2">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {isHirer && contract.status === "pending" && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-warning btn-sm gap-1"
                >
                  <Edit3 size={14} /> Edit & Resend
                </button>
              )}
              {isFreelancer && contract.status === "pending" && (
                <>
                  <button onClick={() => doAction("accept")} disabled={actionLoading} className="btn btn-success btn-sm gap-1">
                    <CheckCircle size={14} /> Accept
                  </button>
                  <button onClick={() => doAction("decline")} disabled={actionLoading} className="btn btn-error btn-outline btn-sm gap-1">
                    <XCircle size={14} /> Decline
                  </button>
                </>
              )}
              {isHirer && ["pending", "active"].includes(contract.status) && (
                <button onClick={() => doAction("cancelled")} disabled={actionLoading} className="btn btn-warning btn-outline btn-sm gap-1">
                  <Ban size={14} /> Cancel
                </button>
              )}
              {isHirer && contract.status === "active" && (
                <button onClick={() => doAction("completed")} disabled={actionLoading} className="btn btn-success btn-sm gap-1">
                  <CheckCircle size={14} /> Mark Completed
                </button>
              )}
              {contract.status === "active" && (
                <>
                  <button onClick={() => setShowDispute(!showDispute)} className="btn btn-error btn-outline btn-sm gap-1">
                    <AlertTriangle size={14} /> Dispute
                  </button>
                  {showDispute && (
                    <div className="w-full mt-2 flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        placeholder="Reason for dispute..."
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        maxLength={500}
                      />
                      <button onClick={() => doAction("dispute")} disabled={actionLoading} className="btn btn-error btn-sm">
                        Submit Dispute
                      </button>
                    </div>
                  )}
                </>
              )}
              {isFreelancer && ["pending", "active"].includes(contract.status) && (
                <button
                  onClick={() => { setShowModifyForm(!showModifyForm); setModifyFields([]); setModifyNotes(""); }}
                  className="btn btn-outline btn-sm gap-1"
                >
                  <PenLine size={14} /> Request Modification
                </button>
              )}
              {isHirer && contract.status === "completed" && !contract.rating && (
                <button onClick={() => setShowRating(!showRating)} className="btn btn-primary btn-sm gap-1">
                  <Star size={14} /> Leave a Rating
                </button>
              )}
            </div>
            {showModifyForm && isFreelancer && (
              <div className="mt-4 p-4 bg-base-200/60 rounded-lg space-y-3 border border-base-300">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <PenLine size={14} className="text-primary" /> Which parts do you want changed?
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Title", "Description", "Amount", "Start Date", "End Date", "Skills"].map((field) => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={modifyFields.includes(field)}
                        onChange={(e) =>
                          setModifyFields(e.target.checked
                            ? [...modifyFields, field]
                            : modifyFields.filter((f) => f !== field)
                          )
                        }
                      />
                      <span className="text-sm">{field}</span>
                    </label>
                  ))}
                </div>
                <div className="form-control">
                  <label className="label py-0.5"><span className="label-text text-xs mr-2">Additional notes / suggested changes</span></label>
                  <textarea
                    className="textarea textarea-bordered textarea-sm"
                    rows={3}
                    placeholder="Describe what you'd like adjusted and why…"
                    value={modifyNotes}
                    onChange={(e) => setModifyNotes(e.target.value)}
                    maxLength={1000}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowModifyForm(false); setModifyFields([]); setModifyNotes(""); }}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitModificationRequest}
                    disabled={modifyLoading || (modifyFields.length === 0 && !modifyNotes.trim())}
                    className="btn btn-primary btn-sm gap-1"
                  >
                    {modifyLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send Request
                  </button>
                </div>
              </div>
            )}
            {showRating && (
              <div className="mt-4 space-y-3 p-4 bg-base-200/50 rounded-lg">
                <h4 className="font-bold text-sm">Rate {contract.freelancer?.name}</h4>
                {["workQuality", "communication", "reliability"].map((field) => (
                  <div key={field} className="form-control">
                    <label className="label py-0.5">
                      <span className="label-text text-xs capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="label-text-alt font-bold">{ratingForm[field]}/5</span>
                    </label>
                    <input
                      type="range"
                      min={1} max={5} step={1}
                      className="range range-primary range-xs"
                      value={ratingForm[field]}
                      onChange={(e) => setRatingForm({ ...ratingForm, [field]: Number(e.target.value) })}
                    />
                    <div className="flex justify-between px-1 text-[9px] text-base-content/30">
                      {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                    </div>
                  </div>
                ))}
                <div className="form-control">
                  <label className="label py-0.5"><span className="label-text text-xs">Comment</span></label>
                  <textarea
                    className="textarea textarea-bordered textarea-sm"
                    rows={2}
                    value={ratingForm.comment}
                    onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                    placeholder="How was working with this freelancer?"
                    maxLength={1000}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowRating(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  <button onClick={submitRating} disabled={actionLoading} className="btn btn-primary btn-sm gap-1">
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                    Submit Rating
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {contract.modificationRequests?.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="font-bold text-sm flex items-center gap-1.5 mb-2">
              <PenLine size={14} className="text-warning" /> Modification Requests
            </h3>
            <div className="space-y-3">
              {contract.modificationRequests.map((req) => (
                <div
                  key={req._id}
                  className={`p-3 rounded-lg border ${
                    req.status === "pending"
                      ? "bg-warning/5 border-warning/30"
                      : req.status === "resolved"
                      ? "bg-success/5 border-success/20 opacity-70"
                      : "bg-base-200/50 border-base-300 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`badge badge-xs py-2 ${
                      req.status === "pending" ? "badge-warning" : req.status === "resolved" ? "badge-success" : "badge-ghost"
                    }`}>
                      {req.status === "pending" ? "Awaiting review" : req.status === "resolved" ? "Acknowledged" : "Dismissed"}
                    </span>
                    <span className="text-[10px] text-base-content/40">
                      {new Date(req.requestedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  {req.fields?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      <span className="text-xs text-base-content/50 self-center">Wants to change:</span>
                      {req.fields.map((f) => (
                        <span key={f} className="badge badge-outline badge-xs py-1.5 font-medium">{f}</span>
                      ))}
                    </div>
                  )}

                  {req.notes && (
                    <p className="text-sm text-base-content/70 italic">"{req.notes}"</p>
                  )}
                  {isHirer && req.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="btn btn-success btn-xs gap-1"
                        onClick={async () => {
                          try {
                            const res = await contractAPI.resolveModificationRequest(id, req._id, "resolved");
                            setContract(res.data.contract);
                            toast.success("Acknowledged — update the contract if needed");
                          } catch { toast.error("Failed"); }
                        }}
                      >
                        <CheckCircle size={10} /> Acknowledge
                      </button>
                      <button
                        className="btn btn-ghost btn-xs gap-1"
                        onClick={async () => {
                          try {
                            const res = await contractAPI.resolveModificationRequest(id, req._id, "dismissed");
                            setContract(res.data.contract);
                            toast.success("Request dismissed");
                          } catch { toast.error("Failed"); }
                        }}
                      >
                        <XCircle size={10} /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <ContractModal
          freelancer={contract.freelancer}
          contractToEdit={contract}
          onClose={() => setShowEditModal(false)}
          onCreated={() => {
            setShowEditModal(false);
            toast.success("Revised contract sent!");
          }}
        />
      )}
      {showPrint && (
        <ContractPrintModal
          contract={contract}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
