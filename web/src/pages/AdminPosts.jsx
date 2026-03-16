import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search, ChevronLeft, ChevronRight, Trash2, Image,
  X, MessageSquare, Heart, Clock, ExternalLink,
} from "lucide-react";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [detailPost, setDetailPost] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPosts({ page, limit: 20, search });
      setPosts(res.data.posts);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openDetail = async (postId) => {
    setDetailLoading(true);
    setDetailPost(null);
    try {
      const res = await adminAPI.getPost(postId);
      setDetailPost(res.data.post);
    } catch { toast.error("Failed to load post"); }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal);
    try {
      await adminAPI.deletePost(deleteModal);
      toast.success("Post deleted");
      setDeleteModal(null);
      setDetailPost(null);
      fetchPosts();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setActionLoading(null); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!detailPost) return;
    setActionLoading(commentId);
    try {
      await adminAPI.deleteComment(detailPost._id, commentId);
      toast.success("Comment deleted");
      // refresh the detail
      const res = await adminAPI.getPost(detailPost._id);
      setDetailPost(res.data.post);
      fetchPosts(); // refresh counts
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setActionLoading(null); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "2-digit" });
  const fmtTime = (d) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Content Moderation — Posts</h1>
        <p className="text-base-content/50 text-sm">Review and remove inappropriate posts</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-lg">
        <Search size={16} className="text-base-content/40 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search post content…"
          className="input input-bordered input-sm w-full"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
        />
        <button className="btn btn-sm btn-primary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</button>
        <span className="text-xs text-base-content/50 whitespace-nowrap">{totalCount} posts</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table table-sm w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Author</th>
              <th>Content</th>
              <th>Media</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><span className="loading loading-spinner" /></td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-base-content/40">No posts found</td></tr>
            ) : posts.map((p) => (
              <tr key={p._id} className="hover cursor-pointer" onClick={() => openDetail(p._id)}>
                <td>
                  <Link
                    to={`/profile/${p.author?._id}`}
                    className="flex items-center gap-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="avatar">
                      <div className="w-7 h-7 rounded-full bg-base-300">
                        {p.author?.profilePhoto && <img src={p.author.profilePhoto} alt={p.author.name} />}
                      </div>
                    </div>
                    <span className="text-sm font-medium">{p.author?.name || "Deleted"}</span>
                  </Link>
                </td>
                <td>
                  <p className="text-sm max-w-xs truncate">{p.content}</p>
                </td>
                <td>
                  {p.imageUrl ? (
                    <span className="badge badge-info badge-sm gap-1"><Image size={10} /> Image</span>
                  ) : (
                    <span className="text-base-content/30 text-xs">—</span>
                  )}
                </td>
                <td className="text-sm">{p.likes?.length || 0}</td>
                <td className="text-sm">{p.comments?.length || 0}</td>
                <td className="text-xs text-base-content/50">{fmtDate(p.createdAt)}</td>
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

      {/* ── Post Detail Modal ────────────────────────────────────────────── */}
      {(detailPost || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setDetailPost(null); setDetailLoading(false); }}>
          <div className="card bg-base-100 shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>
            ) : detailPost && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-base-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/profile/${detailPost.author?._id}`} className="flex items-center gap-2 hover:underline min-w-0">
                      <div className="avatar flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-base-300">
                          {detailPost.author?.profilePhoto && <img src={detailPost.author.profilePhoto} alt="" />}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{detailPost.author?.name || "Deleted"}</p>
                        <p className="text-xs text-base-content/40">{fmtTime(detailPost.createdAt)}</p>
                      </div>
                    </Link>
                  </div>
                  <button className="btn btn-sm btn-ghost btn-circle" onClick={() => setDetailPost(null)}>
                    <X size={16} />
                  </button>
                </div>

                {/* Body — scrollable */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                  {/* Content */}
                  <p className="text-sm whitespace-pre-wrap">{detailPost.content}</p>

                  {/* Image */}
                  {detailPost.imageUrl && (
                    <img
                      src={detailPost.imageUrl}
                      alt="Post"
                      className="rounded-lg max-h-64 w-full object-cover border border-base-300"
                    />
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-base-content/50">
                    <span className="flex items-center gap-1"><Heart size={12} /> {detailPost.likes?.length || 0} likes</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {detailPost.comments?.length || 0} comments</span>
                  </div>

                  {/* Comments */}
                  {detailPost.comments?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Comments</h4>
                      {detailPost.comments.map((c) => (
                        <div key={c._id} className="flex gap-2 items-start bg-base-200/60 rounded-lg p-2.5">
                          <Link to={`/profile/${c.author?._id}`} className="avatar flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <div className="w-7 h-7 rounded-full bg-base-300">
                              {c.author?.profilePhoto && <img src={c.author.profilePhoto} alt="" />}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link to={`/profile/${c.author?._id}`} className="text-xs font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                                {c.author?.name || "Deleted"}
                              </Link>
                              <span className="text-[10px] text-base-content/40 flex items-center gap-0.5">
                                <Clock size={9} /> {fmtTime(c.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs mt-0.5 whitespace-pre-wrap">{c.content}</p>

                            {/* Replies */}
                            {c.replies?.length > 0 && (
                              <div className="mt-2 ml-2 pl-2 border-l-2 border-base-300 space-y-1.5">
                                {c.replies.map((r) => (
                                  <div key={r._id} className="flex gap-2 items-start">
                                    <Link to={`/profile/${r.author?._id}`} className="avatar flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <div className="w-5 h-5 rounded-full bg-base-300">
                                        {r.author?.profilePhoto && <img src={r.author.profilePhoto} alt="" />}
                                      </div>
                                    </Link>
                                    <div className="min-w-0">
                                      <Link to={`/profile/${r.author?._id}`} className="text-[11px] font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                                        {r.author?.name || "Deleted"}
                                      </Link>
                                      <p className="text-[11px] text-base-content/70">{r.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            className="btn btn-ghost btn-xs text-error flex-shrink-0"
                            title="Delete comment"
                            disabled={actionLoading === c._id}
                            onClick={() => handleDeleteComment(c._id)}
                          >
                            {actionLoading === c._id
                              ? <span className="loading loading-spinner loading-xs" />
                              : <Trash2 size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-base-300 flex items-center justify-between">
                  <Link
                    to={`/profile/${detailPost.author?._id}`}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <ExternalLink size={12} /> View Author
                  </Link>
                  <button
                    className="btn btn-error btn-sm gap-1"
                    onClick={() => { setDeleteModal(detailPost._id); }}
                  >
                    <Trash2 size={13} /> Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal(null)}>
          <div className="card bg-base-100 shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="card-body p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Trash2 size={18} className="text-error" /> Delete Post
              </h3>
              <p className="text-sm text-base-content/70">Are you sure you want to permanently delete this post? This action cannot be undone.</p>
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
