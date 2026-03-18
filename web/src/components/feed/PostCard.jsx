import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2, MapPin, Send, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import { feedAPI } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import { UserBadges } from "../badge/BadgeSystem";

export default function PostCard({ post, onDelete, initialShowComments = false }) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [showComments, setShowComments] = useState(initialShowComments);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const inputRef = useRef();
  const replyInputRef = useRef();

  useEffect(() => {
    if (initialShowComments) setTimeout(() => inputRef.current?.focus(), 200);
  }, [initialShowComments]);

  useEffect(() => {
    if (replyingTo) setTimeout(() => replyInputRef.current?.focus(), 100);
  }, [replyingTo]);

  const handleLike = async () => {
    try {
      const res = await feedAPI.likePost(post._id);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch {}
  };

  const handleDelete = async () => {
    try { await feedAPI.deletePost(post._id); onDelete?.(post._id); } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await feedAPI.commentOnPost(post._id, { content: commentText.trim() });
      setComments(res.data.comments || []);
      setCommentText("");
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim() || replySubmitting) return;
    setReplySubmitting(true);
    try {
      const res = await feedAPI.replyToComment(post._id, commentId, { content: replyText.trim() });
      setComments(res.data.comments || []);
      setReplyText("");
      setReplyingTo(null);
    } catch {} finally {
      setReplySubmitting(false);
    }
  };

  const toggleComments = () => {
    setShowComments((v) => !v);
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 150);
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const Avatar = ({ src, name, size = "w-7 h-7" }) => (
    <div className={`${size} rounded-full shrink-0 overflow-hidden bg-base-300 ring-1 ring-base-content/10`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
    </div>
  );

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        {/* Author header */}
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.author?._id}`} className="avatar shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-10 rounded-full">
              {post.author?.profilePhoto ? (
                <img src={post.author.profilePhoto} alt={post.author.name} />
              ) : (
                <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full font-bold text-sm rounded-full">
                  {post.author?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Link to={`/profile/${post.author?._id}`} className="font-semibold text-sm hover:underline">{post.author?.name}</Link>
                {post.author?.badgeLevel > 0 || post.author?.isHirer
                  ? <UserBadges user={post.author} size="xs" />
                  : null}
                {post.author?.location && (
                  <p className="text-xs text-base-content/50 flex items-center gap-1">
                    <MapPin size={10} />{post.author.location.split(",")[0]}
                  </p>
                )}
              </div>
              {user?._id === post.author?._id && (
                <button onClick={handleDelete} className="btn btn-ghost btn-xs text-base-content/40 hover:text-error">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{post.content}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="post" className="mt-2 rounded-lg max-h-80 object-cover w-full" />
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-base-200">
          <button
            onClick={handleLike}
            className={`btn btn-ghost btn-xs gap-1.5 ${liked ? "text-error" : "text-base-content/60 hover:text-error"}`}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} strokeWidth={2} />
            <span>{likes}</span>
          </button>
          <button
            onClick={toggleComments}
            className={`btn btn-ghost btn-xs gap-1.5 ${showComments ? "text-primary" : "text-base-content/60 hover:text-primary"}`}
          >
            <MessageCircle size={14} />
            <span>{comments.length}</span>
            {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <span className="ml-auto text-xs text-base-content/30">{timeAgo(post.createdAt)}</span>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 space-y-3">
            {/* Comment list */}
            {comments.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comments.map((c, i) => (
                  <div key={c._id || i}>
                    {/* Comment row */}
                    <div className="flex items-start gap-2">
                      <Avatar src={c.author?.profilePhoto} name={c.author?.name} />
                      <div className="flex-1 min-w-0">
                        <div className="bg-base-200/60 rounded-xl px-3 py-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold">{c.author?.name || "User"}</span>
                            <span className="text-[10px] text-base-content/30">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-sm mt-0.5 text-base-content/80 break-words">{c.content}</p>
                        </div>
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === c._id ? null : c._id);
                            setReplyText("");
                          }}
                          className="text-[11px] text-base-content/40 hover:text-primary ml-2 mt-0.5 flex items-center gap-1 transition-colors"
                        >
                          <CornerDownRight size={11} />
                          {replyingTo === c._id ? "Cancel" : "Reply"}
                        </button>
                      </div>
                    </div>

                    {/* Nested replies */}
                    {c.replies?.length > 0 && (
                      <div className="ml-9 mt-1.5 space-y-1.5 border-l-2 border-base-content/10 pl-3">
                        {c.replies.map((r, j) => (
                          <div key={r._id || j} className="flex items-start gap-2">
                            <Avatar src={r.author?.profilePhoto} name={r.author?.name} size="w-6 h-6" />
                            <div className="flex-1 min-w-0 bg-base-200/40 rounded-lg px-2.5 py-1.5">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[11px] font-semibold">{r.author?.name || "User"}</span>
                                <span className="text-[10px] text-base-content/30">{timeAgo(r.createdAt)}</span>
                              </div>
                              <p className="text-xs mt-0.5 text-base-content/80 break-words">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline reply input */}
                    {replyingTo === c._id && (
                      <form
                        onSubmit={(e) => handleReply(e, c._id)}
                        className="ml-9 mt-1.5 flex items-center gap-2"
                      >
                        <Avatar src={user?.profilePhoto} name={user?.name} size="w-6 h-6" />
                        <div className="flex-1 flex items-center gap-2 bg-base-200/60 rounded-full px-3 py-1">
                          <input
                            ref={replyInputRef}
                            type="text"
                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-base-content/30 min-w-0"
                            placeholder={`Reply to ${c.author?.name || "comment"}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={replySubmitting}
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim() || replySubmitting}
                            className="text-primary disabled:text-base-content/20 transition-colors shrink-0"
                          >
                            {replySubmitting ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <Send size={13} strokeWidth={2} />
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/40 text-center py-2">No comments yet. Be the first!</p>
            )}

            {/* New comment input */}
            <form onSubmit={handleComment} className="flex items-center gap-2 mt-1">
              <Avatar src={user?.profilePhoto} name={user?.name} />
              <div className="flex-1 flex items-center gap-2 bg-base-200/60 rounded-full px-3 py-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/30 min-w-0"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="text-primary disabled:text-base-content/20 transition-colors hover:text-primary/70 shrink-0"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Send size={15} strokeWidth={2} />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
