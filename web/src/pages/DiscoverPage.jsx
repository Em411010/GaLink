import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { userAPI } from "../services/api";
import FreelancerCard from "../components/discover/FreelancerCard";
import { Search, Users, ArrowLeft } from "lucide-react";

export default function DiscoverPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get("q") || "";

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchFreelancers = async (q = "", p = 1) => {
    setLoading(true);
    try {
      const res = await userAPI.getFreelancers({ q: q.trim() || undefined, page: p });
      setFreelancers(res.data.freelancers || []);
      setPagination(res.data.pagination);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFreelancers(urlQuery, 1);
  }, [urlQuery]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          {urlQuery ? (
            <>
              <h1 className="text-xl font-bold">Results for &ldquo;{urlQuery}&rdquo;</h1>
              <p className="text-base-content/50 text-sm">
                {pagination ? `${pagination.total} freelancer${pagination.total !== 1 ? "s" : ""} found` : "Searching\u2026"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Users size={20} className="text-primary" /> All Freelancers
              </h1>
              <p className="text-base-content/50 text-sm">Browse talented professionals</p>
            </>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-base-content/25" />
          </div>
          <h3 className="text-lg font-bold mb-1">No Freelancers Found</h3>
          <p className="text-base-content/50 text-sm mb-4">Try different keywords or browse all freelancers.</p>
          {urlQuery && (
            <Link to="/discover" className="btn btn-primary btn-sm">View All</Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freelancers.map((f) => (
              <FreelancerCard key={f._id} freelancer={f} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-8 mb-2">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={page === 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchFreelancers(urlQuery, p); }}
                >
                  Previous
                </button>
                <button className="join-item btn btn-sm btn-active">
                  {page} / {pagination.pages}
                </button>
                <button
                  className="join-item btn btn-sm"
                  disabled={page >= pagination.pages}
                  onClick={() => { const p = page + 1; setPage(p); fetchFreelancers(urlQuery, p); }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
