import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { messageAPI, userAPI, contractAPI } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Send, Paperclip, X, Reply, Trash2, ExternalLink, ArrowLeft, MapPin,
  FileText, CheckCircle, XCircle, DollarSign, Calendar, Tag, Edit3,
} from "lucide-react";
import ContractModal from "../components/contract/ContractModal";
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
  const [modifyContractId, setModifyContractId] = useState(null); // contract msg _id showing modify input
  const [modifyText, setModifyText] = useState("");
  const [showContractModal, setShowContractModal] = useState(false);
  const [editContract, setEditContract] = useState(null); // contract object to pre-fill in edit mode

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
      <div className={`${activeConversation || pendingUser ? "flex" : "hidden md:flex"} flex-1 bg-base-100 rounded-lg shadow-md flex-col overflow-hidden`}>
        {!activeConversation && !pendingUser ? (
          <div className="flex-1 flex items-center justify-center text-base-content/40">
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
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
                  {activeOther.location && (
                    <p className="text-xs text-base-content/40 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {activeOther.location}
                    </p>
                  )}
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

                // ── Contract message bubble ──────────────
                if (msg.messageType === "contract" && msg.contract && !msg.deleted) {
                  const c = msg.contract;
                  const isFreelancer = c.freelancer?._id === user?._id;
                  const isPending = c.status === "pending";
                  const statusColor = {
                    pending: "badge-warning",
                    active: "badge-info",
                    completed: "badge-success",
                    cancelled: "badge-ghost",
                    disputed: "badge-error",
                  }[c.status] || "badge-ghost";

                  const handleAccept = async () => {
                    try {
                      await contractAPI.acceptContract(c._id);
                      toast.success("Contract accepted!");
                      setMessages((prev) =>
                        prev.map((m) =>
                          m._id === msg._id
                            ? { ...m, contract: { ...m.contract, status: "active" } }
                            : m
                        )
                      );
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to accept");
                    }
                  };

                  const handleDecline = async () => {
                    try {
                      await contractAPI.declineContract(c._id);
                      toast.success("Contract declined");
                      setMessages((prev) =>
                        prev.map((m) =>
                          m._id === msg._id
                            ? { ...m, contract: { ...m.contract, status: "cancelled" } }
                            : m
                        )
                      );
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to decline");
                    }
                  };

                  return (
                    <div key={msg._id} className={`group flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
                      <div className="max-w-sm w-full">
                        <div className={`rounded-xl border shadow-sm overflow-hidden ${
                          c.status === "pending" ? "border-warning/40 bg-warning/5" :
                          c.status === "active" ? "border-info/40 bg-info/5" :
                          c.status === "completed" ? "border-success/40 bg-success/5" :
                          "border-base-300 bg-base-200/60"
                        }`}>
                          <div className={`h-1 w-full ${
                            c.status === "pending" ? "bg-warning" :
                            c.status === "active" ? "bg-info" :
                            c.status === "completed" ? "bg-success" :
                            "bg-base-300"
                          }`} />
                          <div className="p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <FileText size={15} className="text-primary shrink-0" />
                                <span className="font-bold text-sm line-clamp-1">{c.title}</span>
                              </div>
                              <span className={`badge ${statusColor} badge-xs shrink-0`}>
                                {c.status}
                              </span>
                            </div>
                            {c.description && (
                              <p className="text-xs text-base-content/60 line-clamp-2">{c.description}</p>
                            )}
                            {c.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {c.skills.slice(0, 4).map((s, i) => (
                                  <span key={i} className="badge badge-outline badge-xs py-1.5">
                                    <Tag size={8} className="mr-0.5" />{s}
                                  </span>
                                ))}
                                {c.skills.length > 4 && (
                                  <span className="badge badge-ghost badge-xs">+{c.skills.length - 4}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/50">
                              {c.amount > 0 && (
                                <span className="flex items-center gap-1 font-semibold text-base-content">
                                  <DollarSign size={11} />
                                  ₱{c.amount.toLocaleString()}{c.rateType === "hourly" ? "/hr" : ""}
                                </span>
                              )}
                              {c.startDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={10} />
                                  {new Date(c.startDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                                  {c.endDate && ` – ${new Date(c.endDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`}
                                </span>
                              )}
                            </div>
                            {isFreelancer && isPending && (
                              <div className="space-y-2 mt-1">
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleAccept}
                                    className="btn btn-success btn-xs flex-1 gap-1"
                                  >
                                    <CheckCircle size={12} /> Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      setModifyContractId(modifyContractId === msg._id ? null : msg._id);
                                      setModifyText("");
                                    }}
                                    className="btn btn-warning btn-outline btn-xs flex-1 gap-1"
                                  >
                                    <Edit3 size={12} /> Modify
                                  </button>
                                  <button
                                    onClick={handleDecline}
                                    className="btn btn-error btn-outline btn-xs flex-1 gap-1"
                                  >
                                    <XCircle size={12} /> Decline
                                  </button>
                                </div>
                                {modifyContractId === msg._id && (
                                  <div className="space-y-1.5">
                                    <textarea
                                      className="textarea textarea-bordered textarea-xs w-full leading-snug"
                                      rows={2}
                                      placeholder="Describe what you'd like changed (e.g. budget, timeline, scope)…"
                                      value={modifyText}
                                      onChange={(e) => setModifyText(e.target.value)}
                                      maxLength={500}
                                    />
                                    <button
                                      className="btn btn-warning btn-xs w-full gap-1"
                                      disabled={!modifyText.trim()}
                                      onClick={async () => {
                                        const convId = activeConversation?._id;
                                        if (!convId || !modifyText.trim()) return;
                                        try {
                                          await messageAPI.sendMessage(convId, {
                                            text: `✏️ Modification request for "${c.title}":\n${modifyText.trim()}`,
                                          });
                                          toast.success("Modification request sent");
                                          setModifyContractId(null);
                                          setModifyText("");
                                        } catch {
                                          toast.error("Failed to send request");
                                        }
                                      }}
                                    >
                                      <Send size={10} /> Send Request
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {isMine && isPending && (
                              <button
                                onClick={() => { setEditContract(c); setShowContractModal(true); }}
                                className="btn btn-warning btn-xs w-full gap-1"
                              >
                                <Edit3 size={12} /> Edit & Resend
                              </button>
                            )}
                            {c.status === "active" && (
                              <p className="text-xs text-success font-medium flex items-center gap-1">
                                <CheckCircle size={12} /> Contract accepted
                              </p>
                            )}
                            {c.status === "cancelled" && (
                              <p className="text-xs text-error font-medium flex items-center gap-1">
                                <XCircle size={12} /> Contract declined
                              </p>
                            )}
                            <Link
                              to={`/contracts/${c._id}`}
                              className="text-xs text-primary hover:underline mt-0.5"
                            >
                              View full details →
                            </Link>
                          </div>
                        </div>

                        <div className="text-xs opacity-50 flex flex-wrap items-center gap-1 mt-1 px-1 justify-end">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>·</span>
                          <span>{new Date(msg.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                          {isMine && isLastSeenMsg && <span className="text-primary font-medium">• Seen</span>}
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── Regular message bubble ───────────────
                return (
                  <div key={msg._id} className={`group chat ${isMine ? "chat-end" : "chat-start"}`}>
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

                    <div className="chat-footer text-xs opacity-50 flex flex-wrap items-center gap-1">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>·</span>
                      <span>{new Date(msg.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {(isMine ? user?.location : activeOther?.location) && (
                        <>
                          <span>·</span>
                          <MapPin size={9} />
                          <span>{isMine ? user.location : activeOther.location}</span>
                        </>
                      )}
                      {isMine && isLastSeenMsg && <span className="text-primary font-medium">• Seen</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
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
            {attachPreview && (
              <div className="px-4 py-2 border-t border-base-300 bg-base-200/60 flex items-center gap-2">
                <img src={attachPreview} alt="preview" className="h-14 rounded-lg object-cover" />
                <span className="text-xs text-base-content/60 flex-1 truncate">{attachFile?.name}</span>
                <button className="btn btn-ghost btn-xs" onClick={clearAttach}>
                  <X size={14} />
                </button>
              </div>
            )}
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
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setEditContract(null); setShowContractModal(true); }}
                title="Create contract"
              >
                <FileText size={18} className="text-secondary" />
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
            {showContractModal && activeOther?._id && (
              <ContractModal
                freelancer={editContract ? (editContract.hirer?._id === user?._id ? editContract.freelancer : editContract.hirer) : activeOther}
                contractToEdit={editContract || undefined}
                skipNavigate
                onClose={() => { setShowContractModal(false); setEditContract(null); }}
                onCreated={() => {
                  setShowContractModal(false);
                  setEditContract(null);
                  // Refresh messages to show the new contract bubble
                  if (activeConversation?._id) {
                    messageAPI.getMessages(activeConversation._id)
                      .then((res) => setMessages(res.data || []))
                      .catch(() => {});
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
    </AccessGate>
  );
}
