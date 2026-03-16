import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { feedAPI } from "../../services/api";

export default function PostModal({ onPost }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) formData.append("image", file);
      const res = await feedAPI.createPost(formData);
      toast.success("Post created!");
      onPost?.(res.data);
      setContent("");
      setFile(null);
      setPreview(null);
      document.getElementById("post_modal").close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="post_modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <X size={16} />
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Create Post</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {preview && (
            <div className="relative mt-2">
              <img src={preview} alt="preview" className="rounded-lg max-h-48 object-cover w-full" />
              <button
                type="button"
                className="btn btn-xs btn-circle btn-neutral absolute top-1 right-1"
                onClick={() => { setFile(null); setPreview(null); }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <label className="btn btn-ghost btn-sm gap-1 cursor-pointer">
              <ImagePlus size={14} /> Add Photo
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !content.trim()}
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : "Post"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
