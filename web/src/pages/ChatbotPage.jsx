import { useState, useRef, useEffect } from "react";
import useChatbotStore from "../store/useChatbotStore";
import useAuthStore from "../store/useAuthStore";
import FreelancerCard from "../components/discover/FreelancerCard";
import { AccessGate } from "../components/badge/BadgeSystem";
import { Send, Trash2, Bot, User } from "lucide-react";

export default function ChatbotPage() {
  const { user } = useAuthStore();
  const { messages, recommendations, isLoading, sendMessage, clearChat, phase } =
    useChatbotStore();
  const [input, setInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleDelete = () => {
    if (confirmDelete) {
      clearChat();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-cancel after 3 seconds if user doesn't confirm
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <AccessGate requiredLevel={1} currentLevel={user?.badgeLevel || 0} feature="AI Assistant">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bot className="text-primary" size={30} />
            AI Assistant
          </h1>
          <p className="text-base-content/60 text-sm">
            {phase === "confirming"
              ? "Confirming your request — reply to confirm or give more details"
              : phase === "clarifying"
              ? "Tell me more so I can find the right person for you"
              : "Describe your problem and I'll find the right person for you"}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className={`btn btn-sm gap-1 transition-all self-start ${
            confirmDelete
              ? "btn-error"
              : "btn-ghost text-base-content/50 hover:text-error"
          }`}
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">{confirmDelete ? "Tap again to delete" : "Delete Conversation"}</span>
          <span className="sm:hidden">{confirmDelete ? "Confirm" : "Delete"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chat area */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5">
              {/* Messages */}
              <div className="h-[65vh] overflow-y-auto space-y-4 mb-4 pr-1">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-8 rounded-full bg-base-300 flex items-center justify-center">
                        {msg.role === "user" ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} className="text-primary" />
                        )}
                      </div>
                    </div>
                    <div
                      className={`chat-bubble text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "chat-bubble-primary"
                          : "chat-bubble"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="chat chat-start">
                    <div className="chat-bubble">
                      <span className="loading loading-dots loading-sm"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick query chips — shown only before user sends anything */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    "My roof is leaking",
                    "Power outlet stopped working",
                    "Kitchen sink won't drain",
                    "Need someone to paint my walls",
                    "Need a carpenter for repairs",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="btn btn-sm btn-outline rounded-full text-xs"
                      onClick={() => sendMessage(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    phase === "confirming"
                      ? 'Reply "yes" or add more details...'
                      : phase === "clarifying"
                      ? "Describe your specific problem..."
                      : "Describe what you need help with..."
                  }
                  className="input input-bordered input-md flex-1 text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-md px-5"
                  disabled={isLoading || !input.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Recommendations sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <h3 className="font-bold text-base mb-3">Recommended Freelancers</h3>
            {recommendations.length === 0 ? (
              <div className="card bg-base-100 shadow-sm border border-base-200 p-5 text-center text-base-content/50">
                <Bot size={32} className="mx-auto mb-2 text-base-content/20" />
                <p className="text-sm">
                  Describe your problem and I'll recommend the best people for you.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[65vh] pr-1">
                {recommendations.slice(0, 8).map((freelancer) => (
                  <FreelancerCard key={freelancer._id} freelancer={freelancer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AccessGate>
  );
}
