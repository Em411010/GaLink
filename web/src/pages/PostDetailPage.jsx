import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { feedAPI } from "../services/api";
import PostCard from "../components/feed/PostCard";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ?focus=comments → PostCard will open comments and focus the input
  const focusComments = searchParams.get("focus") === "comments";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await feedAPI.getPost(id);
        setPost(res.data);
      } catch {
        setError("Post not found or has been deleted.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-base-content/50">{error}</p>
        </div>
      )}

      {post && (
        <PostCard
          post={post}
          initialShowComments={focusComments}
          onDelete={() => navigate("/feed")}
        />
      )}
    </div>
  );
}
