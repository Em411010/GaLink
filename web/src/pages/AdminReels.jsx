import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search, ChevronLeft, ChevronRight, Trash2, Film, Eye,
  X, Heart, Clock, ExternalLink,
} from "lucide-react";

export default function AdminReels() {
  const [reels, setReels] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [detailReel, setDetailReel] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReels({ page, limit: 20, search });
      setReels(res.data.reels);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch { toast.error("Failed to load reels"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  const openDetail = async (reelId) => {
    setDetailLoading(true);
    setDetailReel(null);
    try {
      const res = await adminAPI.getReel(reelId);
      setDetailReel(res.data.reel);
    } catch { toast.error("Failed to load reel"); }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal);
    try {
      await adminAPI.deleteReel(deleteModal);
      toast.success("Reel deleted");
      setDeleteModal(null);
      setDetailReel(null);
      fetchReels();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setActionLoading(null); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "2-digit" });
  const fmtTime = (d) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Content Moderation — Reels</h1>
        <p className="text-base-content/50 text-sm">Review and remove inappropriate reels</p>
      </div>
      <div className="flex items-center gap-2 max-w-lg">
        <Search size={16} className="text-base-content/40 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search reel description…"
          className="input input-bordered input-sm w-full"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
        />
        <button className="btn btn-sm btn-primary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</button>
        <span className="text-xs text-base-content/50 whitespace-nowrap">{totalCount} reels</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table table-sm w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Author</th>
              <th>Description</th>
              <th>Skills</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><span className="loading loading-spinner" /></td></tr>
            ) : reels.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-base-content/40">No reels found</td></tr>
            ) : reels.map((r) => (
              <tr key={r._id} className="hover cursor-pointer" onClick={() => openDetail(r._id)}>
                <td>
                  <Link
                    to={`/profile/${r.author?._id}`}
                    className="flex items-center gap-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="avatar">
                      <div className="w-7 h-7 rounded-full bg-base-300">
                        {r.author?.profilePhoto && <img src={r.author.profilePhoto} alt={r.author.name} />}
                      </div>
                    </div>
                    <span className="text-sm font-medium">{r.author?.name || "Deleted"}</span>
                  </Link>
                </td>
                <td>
                  <p className="text-sm max-w-xs truncate">{r.description || "—"}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {(r.detectedSkills || []).slice(0, 3).map((s) => (
                      <span key={s} className="badge badge-ghost badge-xs">{s}</span>
                    ))}
                    {(r.detectedSkills?.length || 0) > 3 && (
                      <span className="badge badge-ghost badge-xs">+{r.detectedSkills.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="text-sm">
                  <span className="flex items-center gap-1"><Eye size={12} className="text-base-content/40" /> {r.views || 0}</span>
                </td>
                <td className="text-sm">{r.likes?.length || 0}</td>
                <td className="text-xs text-base-content/50">
                  {r.duration ? `${Math.round(r.duration)}s` : "—"}
                </td>
                <td className="text-xs text-base-content/50">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      {(detailReel || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setDetailReel(null); setDetailLoading(false); }}>
          <div className="card bg-base-100 shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>
            ) : detailReel && (
              <>
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-base-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/profile/${detailReel.author?._id}`} className="flex items-center gap-2 hover:underline min-w-0">
                      <div className="avatar flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-base-300">
                          {detailReel.author?.profilePhoto && <img src={detailReel.author.profilePhoto} alt="" />}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{detailReel.author?.name || "Deleted"}</p>
                        <p className="text-xs text-base-content/40">{fmtTime(detailReel.createdAt)}</p>
                      </div>
                    </Link>
                  </div>
                  <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setDetailReel(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                  {detailReel.videoUrl && (
                    <video
                      src={detailReel.videoUrl}
                      controls
                      className="rounded-lg w-full max-h-72 bg-black"
                      poster={detailReel.thumbnailUrl || undefined}
                    />
                  )}
                  {detailReel.description && (
                    <p className="text-sm whitespace-pre-wrap">{detailReel.description}</p>
                  )}
                  {detailReel.detectedSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {detailReel.detectedSkills.map((s) => (
                        <span key={s} className="badge badge-ghost badge-sm">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-base-content/50">
                    <span className="flex items-center gap-1"><Eye size={12} /> {detailReel.views || 0} views</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> {detailReel.likes?.length || 0} likes</span>
                    {detailReel.duration > 0 && (
                      <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(detailReel.duration)}s</span>
                    )}
                  </div>
                  {detailReel.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {detailReel.tags.map((t) => (
                        <span key={t} className="badge badge-outline badge-xs">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-base-300 flex items-center justify-between">
                  <Link
                    to={`/profile/${detailReel.author?._id}`}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <ExternalLink size={12} /> View Author
                  </Link>
                  <button
                    className="btn btn-error btn-sm gap-1"
                    onClick={() => { setDeleteModal(detailReel._id); }}
                  >
                    <Trash2 size={13} /> Delete Reel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal(null)}>
          <div className="card bg-base-100 shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="card-body p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Trash2 size={18} className="text-error" /> Delete Reel
              </h3>
              <p className="text-sm text-base-content/70">Are you sure you want to permanently delete this reel? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm flex-1" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button
                  className="btn btn-error btn-sm flex-1"
                  disabled={actionLoading === deleteModal}
                  onClick={handleDelete}
                >
                  {actionLoading === deleteModal
                    ? <span className="loading loading-spinner loading-xs" />
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
