import { Link } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Users,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Video,
  Brain,
  Search,
} from "lucide-react";

const floatingCards = [
  {
    name: "Maria Santos",
    role: "Full-Stack Developer",
    rating: 4.9,
    skills: ["React", "Node.js"],
    avatar: "MS",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Ernesto Dela Cruz",
    role: "Master Electrician",
    rating: 4.8,
    skills: ["Wiring", "Installation"],
    avatar: "ED",
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "Roberto Ramos",
    role: "Carpenter & Furniture Maker",
    rating: 5.0,
    skills: ["Woodwork", "Renovation"],
    avatar: "RR",
    color: "from-amber-600 to-yellow-700",
  },
];

const demoMatches = [
  {
    name: "Roberto Ramos",
    role: "Carpenter & Furniture Maker",
    rating: 5.0,
    avatar: "RR",
    color: "from-amber-600 to-yellow-700",
    match: 97,
  },
  {
    name: "Fernando Cruz",
    role: "Door & Window Specialist",
    rating: 4.8,
    avatar: "FC",
    color: "from-orange-500 to-red-500",
    match: 91,
  },
];

const steps = [
  {
    icon: <MessageSquare className="w-7 h-7" />,
    title: "Describe Your Problem",
    desc: "Tell our AI what you need in plain language — no forms, no filters, just type.",
    color: "bg-violet-500",
    glow: "shadow-violet-500/30",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI Finds the Match",
    desc: "Our engine interprets your request and ranks the best skilled workers for your exact need.",
    color: "bg-blue-500",
    glow: "shadow-blue-500/30",
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "Hire & Collaborate",
    desc: "Message, review work reels, and close the deal — all in one place.",
    color: "bg-emerald-500",
    glow: "shadow-emerald-500/30",
  },
];

const problems = [
  "Posting a job takes hours of back-and-forth with unqualified applicants",
  "Generic platforms don't understand your specific technical needs",
  "No way to see real work samples before committing to a hire",
];

const features = [
  {
    icon: <Brain className="w-6 h-6 text-violet-400" />,
    title: "AI Chatbot Matching",
    desc: "Just describe your problem. GPT interprets it and our matching engine ranks the best skilled workers instantly.",
  },
  {
    icon: <Video className="w-6 h-6 text-blue-400" />,
    title: "Work Reels",
    desc: "Browse short video portfolios. See actual work, not just a resume. AI tags skills automatically.",
  },
  {
    icon: <Search className="w-6 h-6 text-emerald-400" />,
    title: "Smart Feed",
    desc: "A personalized feed that learns from your interactions and surfaces the most relevant talent.",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-pink-400" />,
    title: "Real-Time Messaging",
    desc: "Chat with skilled workers instantly. Typing indicators, read receipts, and file sharing built in.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100 overflow-x-hidden">

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-base-100/80 border-b border-base-200">
        <div className="w-full px-8 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
              GaLink
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm rounded-full px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-[900px] h-[600px] bg-gradient-to-r from-violet-600/20 via-purple-500/10 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full px-8 lg:px-16 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: Text */}
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Skilled Worker Matching
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
                Describe your problem.{" "}
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  AI finds the right skilled worker
                </span>{" "}
                in seconds.
              </h1>

              <p className="text-lg text-base-content/60 mb-10 max-w-2xl">
                Stop scrolling through endless profiles. GaLink understands your exact need
                and instantly surfaces the best Filipino skilled workers for the job.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="btn btn-primary rounded-full px-8 gap-2 text-base"
                >
                  Try it free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline rounded-full px-8 text-base"
                >
                  Join as skilled worker
                </Link>
              </div>
            </div>

            {/* Right: Floating skilled worker cards */}
            <div className="flex-1 relative h-96 w-full max-w-lg">
              {floatingCards.map((card, i) => (
                <div
                  key={i}
                  className="absolute w-64 bg-base-200 border border-base-300 rounded-2xl p-4 shadow-xl"
                  style={{
                    top: `${i * 32}%`,
                    left: i % 2 === 0 ? "0%" : "25%",
                    zIndex: i + 1,
                    animation: `float ${3 + i * 0.7}s ease-in-out infinite alternate`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {card.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{card.name}</p>
                      <p className="text-xs text-base-content/50 truncate">{card.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5 text-yellow-400 flex-shrink-0">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">{card.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {card.skills.map((s) => (
                      <span key={s} className="badge badge-sm bg-base-300 border-0 text-base-content/70">
                        {s}
                      </span>
                    ))}
                    <span className="badge badge-sm badge-success gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      Available
                    </span>
                  </div>
                </div>
              ))}

              {/* AI match badge */}
              <div className="absolute bottom-0 right-0 z-10 bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl px-4 py-3 shadow-2xl shadow-violet-500/30"
                style={{ animation: "float 2.5s ease-in-out infinite alternate" }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">98% Match</span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">AI confidence score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────── */}
      <section className="py-20 bg-base-200/50">
        <div className="w-full px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            <div className="lg:w-2/5">
              <h2 className="text-3xl font-bold mb-4">Hiring skilled workers is broken.</h2>
              <p className="text-base-content/60 mb-6">
                Traditional platforms waste your time. GaLink fixes that.
              </p>
              <div className="flex items-center gap-2 text-success font-semibold">
                <CheckCircle className="w-5 h-5" />
                GaLink solves all of this with AI.
              </div>
            </div>
            <div className="lg:w-3/5 flex flex-col gap-4">
              {problems.map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-base-200 border border-base-300 rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-error text-xs font-bold">✕</span>
                  </div>
                  <p className="text-base-content/70">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="w-full px-8 lg:px-16">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-base-content/60">From problem to hired in under 5 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-0.5 bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 opacity-30" />

            {steps.map((step, i) => (
              <div key={i} className="relative bg-base-200 border border-base-300 rounded-2xl p-6 text-center hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl ${step.glow}`}>
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-base-100 border border-base-300 flex items-center justify-center text-xs font-bold text-base-content/40">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2 text-left">{step.title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed text-left">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Teaser ──────────────────────────────────────────── */}
      <section className="py-20 bg-base-200/50">
        <div className="w-full px-8 lg:px-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3">See the AI in action</h2>
            <p className="text-base-content/60">Type any problem. Watch our AI match you instantly.</p>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-3xl overflow-hidden shadow-2xl">
            {/* Fake browser bar */}
            <div className="bg-base-200 px-4 py-3 flex items-center gap-2 border-b border-base-300">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 bg-base-300 rounded-lg h-6 mx-4 flex items-center px-3">
                <span className="text-xs text-base-content/40">galink.app/chatbot</span>
              </div>
            </div>

            {/* Mock chatbot UI */}
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs text-base-content/40 uppercase tracking-wider font-semibold mb-4">AI Chat</p>

                <div className="bg-base-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                  <p className="text-sm text-base-content/70">Hi! Describe what you need help with.</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-sm ml-auto">
                  <p className="text-sm">Kailangan ko ng carpenter para mag-renovate ng sala namin. Budget ₱15,000, ASAP.</p>
                </div>

                <div className="bg-base-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-violet-400 font-semibold">AI Interpreted</span>
                  </div>
                  <p className="text-sm text-base-content/70">Found <strong>3 top matches</strong> for carpentry & renovation near you →</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-base-content/40 uppercase tracking-wider font-semibold mb-4">Top Matches</p>
                {demoMatches.map((card, i) => (
                  <div key={i} className="flex items-center gap-3 bg-base-200 rounded-xl p-3 border border-base-300">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {card.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{card.name}</p>
                      <p className="text-xs text-base-content/50">{card.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-yellow-400 justify-end">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{card.rating}</span>
                      </div>
                      <span className="text-xs text-violet-400 font-semibold">{card.match}% match</span>
                    </div>
                  </div>
                ))}
                <button className="w-full btn btn-primary btn-sm rounded-xl gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message Top Match
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="w-full px-8 lg:px-16">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-3">Everything you need to hire smarter</h2>
            <p className="text-base-content/60">Purpose-built for the Filipino freelancing ecosystem.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group bg-base-200 border border-base-300 rounded-2xl p-6 hover:border-primary/30 hover:bg-base-200/80 transition-all hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-base-300 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-8 lg:px-16">
        <div className="w-full">
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-6">
                  <Users className="w-3.5 h-3.5" />
                  Join today — it's free
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4">
                  Ready to find your perfect skilled worker?
                </h2>
                <p className="text-white/70 text-lg">
                  Stop wasting time. Let AI do the matching.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  to="/register"
                  className="btn bg-white text-violet-700 hover:bg-white/90 rounded-full px-8 gap-2 border-0 text-base font-bold"
                >
                  Find a skilled worker <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-full px-8 text-base"
                >
                  Join as skilled worker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-base-200 py-8">
        <div className="w-full px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
              GaLink
            </span>
          </div>
          <p className="text-sm text-base-content/40">
            AI-powered skilled worker discovery · Built for Filipino talent
          </p>
          <div className="flex gap-4 text-sm text-base-content/50">
            <Link to="/login" className="hover:text-base-content transition-colors">Log in</Link>
            <Link to="/register" className="hover:text-base-content transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

      {/* Float animation */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
