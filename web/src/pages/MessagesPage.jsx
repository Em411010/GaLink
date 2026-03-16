import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { messageAPI, userAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Send, Paperclip, X, Reply, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";
import { AccessGate } from "../components/badge/BadgeSystem";
import { UserBadges } from "../components/badge/BadgeSystem";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDateSeparator(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function buildDateGroups(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== lastDate) {
      groups.push({ type: "separator", label: formatDateSeparator(msg.createdAt), key: `sep-${day}` });
      lastDate = day;
    }
    groups.push({ type: "message", msg });
  }
  return groups;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);       // message being replied to
  const [attachFile, setAttachFile] = useState(null);  // File | null
  const [attachPreview, setAttachPreview] = useState(null); // object URL
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // msgId awaiting confirm

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── conversations ────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data || []);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── ?userId= param ───────────────────────────────────────────────────────

  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (!targetUserId || !user || loading) return;
    const existing = conversations.find((c) =>
      c.participants?.some((p) => p._id === targetUserId)
    );
    if (existing) { openConversation(existing); return; }
    userAPI.getProfile(targetUserId)
      .then((res) => { setPendingUser(res.data); setActiveConversation(null); setMessages([]); })
      .catch(() => toast.error("Could not load user profile"));
  }, [searchParams, user, loading]);

  // ── socket ───────────────────────────────────────────────────────────────

  useEffect(() => {
    socketRef.current = io(window.location.origin, { withCredentials: true });
    if (user) socketRef.current.emit("user:online", user._id);

    socketRef.current.on("onlineUsers", (ids) => setOnlineUsers(ids));

    socketRef.current.on("message:receive", (message) => {
      setMessages((prev) => [...prev, message]);
      // clear unread badge for active conv
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversation
            ? { ...c, lastMessage: { text: message.text || "📎", sender: message.sender._id, timestamp: message.createdAt }, unreadCount: 0 }
            : c
        )
      );
    });

    socketRef.current.on("messages:read", ({ convId, userId: readerId }) => {
      if (readerId !== user?._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.conversation === convId && !m.readBy?.includes(readerId)
              ? { ...m, readBy: [...(m.readBy || []), readerId] }
              : m
          )
        );
      }
    });

    socketRef.current.on("message:deleted", ({ msgId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, deleted: true, text: "", attachments: [] } : m))
      );
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  // ── join / leave room ────────────────────────────────────────────────────

  useEffect(() => {
    if (activeConversation && socketRef.current) {
      socketRef.current.emit("conversation:join", activeConversation._id);
      return () => socketRef.current.emit("conversation:leave", activeConversation._id);
    }
  }, [activeConversation]);

  // ── fetch messages + mark read ───────────────────────────────────────────

  useEffect(() => {
    if (!activeConversation) return;
    messageAPI.getMessages(activeConversation._id)
      .then((res) => setMessages(res.data || []))
      .catch(() => toast.error("Failed to load messages"));
    messageAPI.markAsRead(activeConversation._id).catch(() => {});
    // Clear badge locally
    setConversations((prev) =>
      prev.map((c) => (c._id === activeConversation._id ? { ...c, unreadCount: 0 } : c))
    );
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const getOtherParticipant = (conv) =>
    conv?.participants?.find((p) => p._id !== user?._id) || {};

  const activeOther = pendingUser || getOtherParticipant(activeConversation);
  const isOnline = (userId) => onlineUsers.includes(userId);

  function openConversation(conv) {
    setActiveConversation(conv);
    setPendingUser(null);
    setReplyTo(null);
    setAttachFile(null);
    setAttachPreview(null);
  }

  function handleAttachSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachFile(file);
    setAttachPreview(URL.createObjectURL(file));
  }

  function clearAttach() {
    setAttachFile(null);
    if (attachPreview) URL.revokeObjectURL(attachPreview);
    setAttachPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── send ─────────────────────────────────────────────────────────────────

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachFile) return;

    try {
      let convId = activeConversation?._id;

      if (!convId && pendingUser) {
        const res = await messageAPI.createConversation(pendingUser._id);
        const conv = res.data;
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          return exists ? prev : [conv, ...prev];
        });
        setActiveConversation(conv);
        setPendingUser(null);
        convId = conv._id;
      }
      if (!convId) return;

      if (attachFile) {
        const fd = new FormData();
        fd.append("attachment", attachFile);
        if (newMessage.trim()) fd.append("text", newMessage.trim());
        if (replyTo?._id) fd.append("replyTo", replyTo._id);
        await messageAPI.sendAttachment(convId, fd);
        clearAttach();
      } else {
        const body = { text: newMessage.trim() };
        if (replyTo?._id) body.replyTo = replyTo._id;
        await messageAPI.sendMessage(convId, body);
      }

      setNewMessage("");
      setReplyTo(null);
    } catch {
      toast.error("Failed to send message");
    }
  };

  // ── delete message ───────────────────────────────────────────────────────

  const handleDelete = (msg) => {
    if (!activeConversation) return;
    setConfirmDeleteId(msg._id);
  };

  const confirmDelete = async (msg) => {
    setConfirmDeleteId(null);
    // Optimistic update — mark deleted instantly in local state
    setMessages((prev) =>
      prev.map((m) =>
        m._id === msg._id ? { ...m, deleted: true, text: "", attachments: [] } : m
      )
    );
    try {
      await messageAPI.deleteMessage(activeConversation._id, msg._id);
      toast.success("Message deleted");
    } catch {
      // Roll back on failure
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m))
      );
      toast.error("Failed to delete message");
    }
  };

  // ── read receipts ────────────────────────────────────────────────────────

  const lastMsgSeenByOther = () => {
    if (!messages.length || !activeConversation) return null;
    const other = getOtherParticipant(activeConversation);
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      const isOwnMsg = m.sender?._id === user?._id || m.sender === user?._id;
      if (isOwnMsg && m.readBy?.includes(other._id)) return m._id;
    }
    return null;
  };

  const seenMsgId = activeConversation ? lastMsgSeenByOther() : null;

  // ── render ────────────────────────────────────────────────────────────────

  const confirmDeleteMsg = messages.find((m) => m._id === confirmDeleteId) || null;
  const groups = buildDateGroups(messages);

  return (
    <AccessGate requiredLevel={1} currentLevel={user?.badgeLevel || 0} feature="Messaging">
    <div className="h-[calc(100vh-120px)] flex gap-0 md:gap-4">
      {/* ── Delete confirmation modal ──────────────────────────────────── */}
      {confirmDeleteMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base">Delete message?</h3>
            {(confirmDeleteMsg.text || confirmDeleteMsg.attachments?.length > 0) && (
              <p className="text-sm text-base-content/60 line-clamp-3 bg-base-200 rounded-lg px-3 py-2">
                {confirmDeleteMsg.text || "📎 Attachment"}
              </p>
            )}
            <p className="text-xs text-base-content/50">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => confirmDelete(confirmDeleteMsg)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Conversation List ─────────────────────────────────────────────── */}
      <div className={`${activeConversation || pendingUser ? "hidden md:flex" : "flex"} w-full md:w-80 bg-base-100 rounded-lg shadow-md overflow-hidden flex-col`}>
        <div className="p-4 border-b border-base-300">
          <h2 className="font-bold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center p-4 text-base-content/60 text-sm">No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const online = isOnline(other._id);
              const unread = conv.unreadCount || 0;
              const isActive = activeConversation?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-base-200 transition-colors ${isActive ? "bg-base-200" : ""}`}
                >
                  {/* Avatar + online dot */}
                  <div className="relative shrink-0">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        {other.profilePhoto ? (
                          <img src={other.profilePhoto} alt={other.name} />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full font-bold text-sm">
                            {other.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-base-100" />
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm truncate ${unread > 0 ? "font-bold" : "font-semibold"}`}>
                        {other.name || "User"}{" "}
                        {other.badgeLevel > 0 || other.isHirer
                          ? <UserBadges user={other} size="xs" />
                          : null}
                      </p>
                      {unread > 0 && (
                        <span className="badge badge-primary badge-sm shrink-0">{unread}</span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${unread > 0 ? "text-base-content" : "text-base-content/60"}`}>
                      {conv.lastMessage?.text || "Start a conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <div className={`${activeConversation || pendingUser ? "flex" : "hidden md:flex"} flex-1 bg-base-100 rounded-lg shadow-md flex-col overflow-hidden`}>
        {!activeConversation && !pendingUser ? (
          <div className="flex-1 flex items-center justify-center text-base-content/40">
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────── */}
            <div className="p-4 border-b border-base-300 flex items-center gap-3">
              <button
                className="btn btn-ghost btn-sm btn-circle md:hidden"
                onClick={() => { setActiveConversation(null); setPendingUser(null); }}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                onClick={() => activeOther._id && navigate(`/profile/${activeOther._id}`)}
              >
                <div className="relative">
                  <div className="avatar">
                    <div className="w-9 rounded-full">
                      {activeOther.profilePhoto ? (
                        <img src={activeOther.profilePhoto} alt="" />
                      ) : (
                        <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full font-bold text-sm">
                          {activeOther.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  {isOnline(activeOther._id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-base-100" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold leading-tight">{activeOther.name}</p>
                  <p className="text-xs text-base-content/50">
                    {isOnline(activeOther._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
              <a
                href={`/profile/${activeOther._id}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto btn btn-ghost btn-xs gap-1"
              >
                <ExternalLink size={13} /> View Profile
              </a>
            </div>

            {/* ── Messages ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {groups.map((item) => {
                if (item.type === "separator") {
                  return (
                    <div key={item.key} className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-base-300" />
                      <span className="text-xs text-base-content/40 whitespace-nowrap">{item.label}</span>
                      <div className="flex-1 h-px bg-base-300" />
                    </div>
                  );
                }

                const msg = item.msg;
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                const isLastSeenMsg = msg._id === seenMsgId;

                return (
                  <div key={msg._id} className={`group chat ${isMine ? "chat-end" : "chat-start"}`}>
                    {/* Reply-to quote */}
                    {msg.replyTo && !msg.deleted && (
                      <div className={`text-xs px-3 py-1.5 rounded-t-lg mb-0.5 max-w-xs border-l-4 border-primary/60 bg-base-200/70 ${isMine ? "ml-auto" : ""}`}>
                        <span className="font-semibold text-base-content/60">{msg.replyTo.sender?.name}</span>
                        <p className="truncate text-base-content/50">{msg.replyTo.text || "📎 Attachment"}</p>
                      </div>
                    )}

                    <div className={`chat-bubble relative max-w-xs ${isMine ? "chat-bubble-primary" : ""} ${msg.deleted ? "opacity-50 italic text-sm" : ""}`}>
                      {msg.deleted ? (
                        <span>This message was deleted</span>
                      ) : (
                        <>
                          {msg.attachments?.length > 0 && (
                            <img
                              src={msg.attachments[0].url}
                              alt="attachment"
                              className="rounded-lg max-w-full mb-1 cursor-pointer"
                              onClick={() => window.open(msg.attachments[0].url, "_blank")}
                            />
                          )}
                          {msg.text && <span>{msg.text}</span>}
                        </>
                      )}

                      {/* Hover actions */}
                      {!msg.deleted && (
                        <div className={`absolute top-0 ${isMine ? "right-full pr-1" : "left-full pl-1"} hidden group-hover:flex items-center gap-0.5`}>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setReplyTo(msg)}
                            title="Reply"
                          >
                            <Reply size={12} />
                          </button>
                          {isMine && (
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleDelete(msg)}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="chat-footer text-xs opacity-50 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isMine && isLastSeenMsg && <span className="text-primary font-medium">• Seen</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Reply preview bar ───────────────────────────── */}
            {replyTo && (
              <div className="px-4 py-2 border-t border-base-300 bg-base-200/60 flex items-center gap-2 text-sm">
                <Reply size={14} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-xs">{replyTo.sender?.name}</span>
                  <p className="truncate text-base-content/60 text-xs">{replyTo.text || "📎 Attachment"}</p>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => setReplyTo(null)}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ── Attachment preview bar ──────────────────────── */}
            {attachPreview && (
              <div className="px-4 py-2 border-t border-base-300 bg-base-200/60 flex items-center gap-2">
                <img src={attachPreview} alt="preview" className="h-14 rounded-lg object-cover" />
                <span className="text-xs text-base-content/60 flex-1 truncate">{attachFile?.name}</span>
                <button className="btn btn-ghost btn-xs" onClick={clearAttach}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ── Input ──────────────────────────────────────── */}
            <form onSubmit={handleSend} className="p-4 border-t border-base-300 flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAttachSelect}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                placeholder={replyTo ? "Reply…" : pendingUser ? `Message ${pendingUser.name}…` : "Type a message..."}
                className="input input-bordered flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newMessage.trim() && !attachFile}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </AccessGate>
  );
}
