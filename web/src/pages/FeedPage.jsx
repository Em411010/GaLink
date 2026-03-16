import { useState, useEffect, useCallback } from "react";
import PostCard from "../components/feed/PostCard";
import LeftSidebar from "../components/feed/LeftSidebar";
import RightSidebar from "../components/feed/RightSidebar";
import { feedAPI } from "../services/api";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await feedAPI.getFeed({ page: p });
      const newPosts = res.data.posts || [];
      if (p === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setHasMore(newPosts.length >= 20);
    } catch {
      // Feed may be empty if no posts exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Refresh feed when a post is created via the Navbar modal
  useEffect(() => {
    const onPost = () => fetchPosts(1);
    window.addEventListener("galink:postCreated", onPost);
    return () => window.removeEventListener("galink:postCreated", onPost);
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <div className="grid grid-cols-12 gap-0 w-full items-start">
      {/* Left — 2 cols */}
      <div className="col-span-2 sticky top-20 self-start">
        <LeftSidebar />
      </div>

      {/* Center — 4 cols, starts at col 5 (2-col margin) */}
      <div className="col-start-5 col-span-4 min-w-0 space-y-6 py-0">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Welcome to GaLink!</h2>
            <p className="text-base-content/60">
              No posts yet. Be the first to share your work!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={() => fetchPosts(1)}
              />
            ))}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="btn btn-outline btn-wide"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right — 2 cols, starts at col 11 (2-col margin) */}
      <div className="col-start-11 col-span-2 sticky top-20 self-start">
        <RightSidebar />
      </div>
    </div>
  );
}
