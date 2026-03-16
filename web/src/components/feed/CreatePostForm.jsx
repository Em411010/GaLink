import { useState } from "react";
import { feedAPI } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import { AccessGate } from "../badge/BadgeSystem";
import { ImagePlus } from "lucide-react";
export default function CreatePostForm({ onPost }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) formData.append("image", file);
      const res = await feedAPI.createPost(formData);
      onPost?.(res.data);
      setContent("");
      setFile(null);
    } catch {} finally {
      setLoading(false);
    }
  };
  return (
    <AccessGate requiredLevel={2} currentLevel={user?.badgeLevel || 0} feature="Creating posts">
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm border border-base-200 p-4">
      <textarea className="textarea textarea-bordered w-full resize-none text-sm" rows={3} placeholder="Share something with the community..." value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="flex items-center justify-between mt-2">
        <label className="btn btn-ghost btn-xs gap-1 cursor-pointer">
          <ImagePlus size={14} /> Photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !content.trim()}>
          {loading ? <span className="loading loading-spinner loading-xs" /> : "Post"}
        </button>
      </div>
      {file && <p className="text-xs text-base-content/50 mt-1">{file.name}</p>}
    </form>
    </AccessGate>
  );
}
