import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success("Welcome back!");
      navigate(user?.isAdmin ? "/admin" : "/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Back button */}
      <div className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
                GaLink
              </span>
            </Link>
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-base-content/50 text-sm">Log in to your account</p>
          </div>

          {/* Form */}
          <div className="bg-base-200/60 border border-base-300 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered bg-base-100 focus:border-primary focus:outline-none w-full"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="input input-bordered bg-base-100 focus:border-primary focus:outline-none w-full pr-12"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full rounded-xl mt-2"
                disabled={loading}
              >
                {loading
                  ? <span className="loading loading-spinner loading-sm"></span>
                  : "Log In"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-5 text-base-content/50">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
