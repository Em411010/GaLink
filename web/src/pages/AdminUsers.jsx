import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Search, ChevronLeft, ChevronRight, ShieldCheck,
  UserX, Ban, CheckCircle, Check,
  MoreVertical,
} from "lucide-react";

const BADGE_COLORS = { 0: "badge-ghost", 1: "badge-success", 2: "badge-info", 3: "badge-warning" };
const BADGE_LABELS = { 0: "Unverified", 1: "Hirer 🟢", 2: "Freelancer 🔵", 3: "Verified ⭐" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [badgeLevelFilter, setBadgeLevelFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [revokeModal, setRevokeModal] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 20, search, badgeLevel: badgeLevelFilter });
      setUsers(res.data.users);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, [page, search, badgeLevelFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRevoke = async () => {
    if (!revokeModal) return;
    setActionLoading(revokeModal.userId + "_revoke");
    try {
      await adminAPI.revokeUser(revokeModal.userId, revokeReason);
      toast.success("Verification revoked");
      setRevokeModal(null);
      setRevokeReason("");
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Revoke failed"); }
    finally { setActionLoading(null); }
  };

  const handleBan = async (userId) => {
    setActionLoading(userId + "_ban");
    try {
      await adminAPI.banUser(userId);
      toast.success("User banned");
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Ban failed"); }
    finally { setActionLoading(null); }
  };

  const handleUnban = async (userId) => {
    setActionLoading(userId + "_unban");
    try {
      await adminAPI.unbanUser(userId);
      toast.success("User unbanned");
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Unban failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
        <p className="text-base-content/50 text-sm">View, verify, ban, and manage platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={16} className="text-base-content/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search name or email…"
            className="input input-bordered input-sm w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
          />
          <button className="btn btn-sm btn-primary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</button>
        </div>
        <select
          className="select select-bordered select-sm"
          value={badgeLevelFilter}
          onChange={(e) => { setBadgeLevelFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Levels</option>
          <option value="0">Unverified</option>
          <option value="1">Hirer</option>
          <option value="2">Freelancer</option>
          <option value="3">Verified Freelancer</option>
        </select>
        <span className="text-xs text-base-content/50">{totalCount} users</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table table-sm w-full">
          <thead className="bg-base-200">
            <tr>
              <th>User</th>
              <th>Badge</th>
              <th>KYC</th>
              <th>Clearance</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><span className="loading loading-spinner" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-base-content/40">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full bg-base-300">
                        {u.profilePhoto && <img src={u.profilePhoto} alt={u.name} />}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-base-content/50">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${BADGE_COLORS[u.badgeLevel]} badge-sm`}>{BADGE_LABELS[u.badgeLevel]}</span>
                </td>
                <td>
                  {u.kycStatus === "approved" ? (
                    <span className="badge badge-success badge-sm gap-1"><Check size={10} /> Approved</span>
                  ) : u.kycStatus === "pending" ? (
                    <span className="badge badge-warning badge-sm">Pending</span>
                  ) : u.kycStatus === "rejected" ? (
                    <span className="badge badge-error badge-sm">Rejected</span>
                  ) : u.governmentId?.url || u.selfieUrl ? (
                    <span className="badge badge-ghost badge-sm">Uploaded</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm">None</span>
                  )}
                </td>
                <td>
                  {u.clearanceStatus === "approved" ? (
                    <span className="badge badge-success badge-sm gap-1"><Check size={10} /> Approved</span>
                  ) : u.clearanceStatus === "pending" ? (
                    <span className="badge badge-warning badge-sm">Pending</span>
                  ) : u.clearanceStatus === "rejected" ? (
                    <span className="badge badge-error badge-sm">Rejected</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm">None</span>
                  )}
                </td>
                <td>
                  {u.isActive === false ? (
                    <span className="badge badge-error badge-sm gap-1"><Ban size={10} /> Banned</span>
                  ) : (
                    <span className="badge badge-success badge-sm gap-1"><CheckCircle size={10} /> Active</span>
                  )}
                </td>
                <td className="text-xs text-base-content/50">
                  {new Date(u.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "2-digit" })}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-xs btn-ghost">
                      <MoreVertical size={14} />
                    </button>
                    <ul tabIndex={0} className="dropdown-content z-[10] menu menu-xs shadow-lg bg-base-100 border border-base-300 rounded-box w-44 p-1">
                      {(u.governmentId?.url || u.selfieUrl) && u.kycStatus !== "approved" && (
                        <li>
                          <button
                            className="flex items-center gap-2 text-info"
                            onClick={() => navigate(`/admin/kyc?user=${u._id}`)}
                          >
                            <ShieldCheck size={12} /> Review KYC
                          </button>
                        </li>
                      )}
                      {u.badgeLevel > 0 && (
                        <li>
                          <button
                            className="flex items-center gap-2 text-warning"
                            onClick={() => { setRevokeModal({ userId: u._id, userName: u.name }); setRevokeReason(""); }}
                          >
                            <UserX size={12} /> Revoke Badge
                          </button>
                        </li>
                      )}
                      <li className="border-t border-base-200 mt-1 pt-1">
                        {u.isActive === false ? (
                          <button
                            className="flex items-center gap-2 text-success"
                            disabled={actionLoading === u._id + "_unban"}
                            onClick={() => handleUnban(u._id)}
                          >
                            {actionLoading === u._id + "_unban"
                              ? <span className="loading loading-spinner loading-xs" />
                              : <><CheckCircle size={12} /> Unban User</>}
                          </button>
                        ) : (
                          <button
                            className="flex items-center gap-2 text-error"
                            disabled={actionLoading === u._id + "_ban"}
                            onClick={() => handleBan(u._id)}
                          >
                            {actionLoading === u._id + "_ban"
                              ? <span className="loading loading-spinner loading-xs" />
                              : <><Ban size={12} /> Ban User</>}
                          </button>
                        )}
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRevokeModal(null)}>
          <div className="card bg-base-100 shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="card-body p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserX size={18} className="text-error" /> Revoke Verification
              </h3>
              <p className="text-sm text-base-content/70">
                This will reset <strong>{revokeModal.userName}</strong>&apos;s badge to Level 0.
              </p>
              <textarea
                className="textarea textarea-bordered w-full textarea-sm"
                rows={2}
                placeholder="Reason for revocation (optional)"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm flex-1" onClick={() => setRevokeModal(null)}>Cancel</button>
                <button
                  className="btn btn-error btn-sm flex-1"
                  disabled={actionLoading === revokeModal.userId + "_revoke"}
                  onClick={handleRevoke}
                >
                  {actionLoading === revokeModal.userId + "_revoke"
                    ? <span className="loading loading-spinner loading-xs" />
                    : "Revoke"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
