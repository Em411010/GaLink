import { useState, useEffect, useRef } from "react";
import { Heart, Volume2, VolumeX, MapPin, Eye } from "lucide-react";
import { reelAPI } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import { Link } from "react-router-dom";

export default function ReelCard({ reel, isActive, muted, onToggleMute }) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(reel.likes?.length || 0);
  const [liked, setLiked] = useState(reel.likes?.includes(user?._id));
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = async () => {
    try {
      const res = await reelAPI.likeReel(reel._id);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch {}
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        preload="metadata"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

      {/* Right side action buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-10">
        {/* Author avatar */}
        <Link to={`/profile/${reel.author?._id}`} className="relative">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
            {reel.author?.profilePhoto ? (
              <img src={reel.author.profilePhoto} alt={reel.author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center w-full h-full text-sm font-bold">
                {reel.author?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow">
            <span className="text-white text-[10px] font-bold">+</span>
          </div>
        </Link>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <Heart
            size={30}
            strokeWidth={1.5}
            className={liked ? "text-red-500" : "text-white"}
            fill={liked ? "currentColor" : "none"}
          />
          <span className="text-white text-xs font-semibold drop-shadow">{likes}</span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <Eye size={28} className="text-white" strokeWidth={1.5} />
          <span className="text-white text-xs font-semibold drop-shadow">
            {reel.views > 999 ? `${(reel.views / 1000).toFixed(1)}K` : reel.views}
          </span>
        </div>

        {/* Mute toggle */}
        <button onClick={onToggleMute}>
          {muted
            ? <VolumeX size={28} className="text-white" strokeWidth={1.5} />
            : <Volume2 size={28} className="text-white" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-20 z-10">
        <Link to={`/profile/${reel.author?._id}`} className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-sm drop-shadow">{reel.author?.name}</span>
          {reel.author?.location && (
            <span className="text-white/70 text-xs flex items-center gap-0.5">
              <MapPin size={11} />{reel.author.location.split(",")[0]}
            </span>
          )}
        </Link>
        {reel.description && (
          <p className="text-white/90 text-sm leading-snug line-clamp-3 drop-shadow">{reel.description}</p>
        )}
        {reel.detectedSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reel.detectedSkills.slice(0, 4).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
