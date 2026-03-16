import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        bio: form.bio,
        location: form.address,
      });
      toast.success("Welcome to GaLink!");
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
                GaLink
              </span>
            </Link>
            <h1 className="text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-base-content/50 text-sm">Find work or hire skilled workers today</p>
          </div>

          <div className="bg-base-200/60 border border-base-300 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Full Name <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered bg-base-100 focus:border-primary focus:outline-none w-full"
                    placeholder="Juan dela Cruz"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Email <span className="text-error">*</span></span>
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
                    <span className="label-text font-medium">Password <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="input input-bordered bg-base-100 focus:border-primary focus:outline-none w-full"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Confirm Password <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input input-bordered bg-base-100 focus:border-primary focus:outline-none w-full"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Bio <span className="text-base-content/40 font-normal">(optional)</span></span>
                  </label>
                  <textarea
                    name="bio"
                    className="textarea textarea-bordered bg-base-100 focus:border-primary focus:outline-none w-full resize-none"
                    placeholder="Ano ang iyong expertise o hinahanap?"
                    rows={2}
                    value={form.bio}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Location <span className="text-base-content/40 font-normal">(optional)</span></span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="input input-bordered bg-base-100 focus:border-primary focus:outline-none w-full"
                    placeholder="e.g. Quezon City, Manila"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full rounded-xl mt-2"
                disabled={loading}
              >
                {loading
                  ? <span className="loading loading-spinner loading-sm"></span>
                  : "Create Account"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-5 text-base-content/50">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
