import { useState, useEffect, useRef, useCallback } from "react";
import { reelAPI } from "../services/api";
import ReelCard from "../components/reels/ReelCard";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Film, Plus, X } from "lucide-react";

export default function ReelsPage() {
  const { user } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", videoUrl: "" });
  const [creating, setCreating] = useState(false);
  const itemRefs = useRef([]);

  useEffect(() => { fetchReels(); }, []);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await reelAPI.getReels();
      setReels(res.data.reels || []);
    } catch {
      // no reels
    } finally {
      setLoading(false);
    }
  };

  // Track which reel is centred in the viewport
  useEffect(() => {
    if (reels.length === 0) return;
    const observers = itemRefs.current.map((el, index) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(index); },
        { threshold: 0.6 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [reels]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.videoUrl.trim()) return toast.error("Video URL is required");
    setCreating(true);
    try {
      await reelAPI.createReel(form);
      toast.success("Reel uploaded!");
      setShowCreate(false);
      setForm({ title: "", description: "", videoUrl: "" });
      fetchReels();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload reel");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="-mx-4 -my-6 -mb-20 md:-mb-6 flex items-center justify-center bg-base-200" style={{ height: "calc(100vh - 4rem)" }}>
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="-mx-4 -my-6 -mb-20 md:-mb-6 flex flex-col items-center justify-center bg-base-200" style={{ height: "calc(100vh - 4rem)" }}>
        <Film size={52} className="text-base-content/30 mb-4" />
        <h3 className="text-base-content font-bold text-lg mb-1">No Reels Yet</h3>
        <p className="text-base-content/50 text-sm mb-4">
          {user?.isFreelancer ? "Be the first to share your work!" : "Check back later for freelancer reels."}
        </p>
        {user?.isFreelancer && (
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm gap-1">
            <Plus size={16} /> Upload Reel
          </button>
        )}
      </div>
    );
  }

  return (
    // Break out of layout padding to go full-width/height
    <div className="-mx-4 -my-6 -mb-20 md:-mb-6 relative">
      {/* Snap-scroll feed */}
      <div
        className="overflow-y-scroll snap-y snap-mandatory"
        style={{ height: "calc(100vh - 4rem)", scrollbarWidth: "none" }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel._id}
            ref={(el) => (itemRefs.current[index] = el)}
            className="snap-start w-full flex items-center justify-center bg-base-200"
            style={{ height: "calc(100vh - 4rem)" }}
          >
            {/* Portrait phone-sized container (9:16) */}
            <div
              className="relative overflow-hidden sm:rounded-2xl sm:shadow-2xl"
              style={{
                height: "calc(100vh - 8rem)",
                width: "min(480px, calc((100vh - 8rem) * 10 / 16))",
              }}
            >
              <ReelCard reel={reel} isActive={activeIndex === index} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
            </div>
          </div>
        ))}
      </div>

      {/* Upload FAB (freelancers only) */}
      {user?.isFreelancer && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 md:bottom-8 right-4 z-20 btn btn-primary btn-circle shadow-xl"
          title="Upload Reel"
        >
          <Plus size={22} />
        </button>
      )}

      {/* Upload modal */}
      {showCreate && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div
            className="bg-base-100 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Upload Reel</h3>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Reel title (optional)"
                className="input input-bordered w-full"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                placeholder="Describe your work..."
                className="textarea textarea-bordered w-full"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                type="url"
                placeholder="Video URL (Cloudinary, YouTube, etc.)"
                className="input input-bordered w-full"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                required
              />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn btn-primary flex-1" disabled={creating}>
                  {creating ? <span className="loading loading-spinner loading-sm" /> : "Upload"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
