
import { Link } from "react-router-dom";

const features = [
  {
    icon: "ϟ",
    title: "AI-Powered Matching",
    description: "Find jobs that truly match your skills and goals.",
    path: "/recommendations",
  },
  {
    icon: "▥",
    title: "Real-Time Insights",
    description: "Explore hiring trends, salary data and in-demand skills.",
    path: "/analytics",
  },
  {
    icon: "◎",
    title: "Skill Gap Analysis",
    description: "Know what to learn to unlock better opportunities.",
    path: "/skill-gap",
  },
  {
    icon: "↗",
    title: "Personalized Roadmap",
    description: "Get a clear plan for your career growth.",
    path: "/roadmap",
  },
];

const steps = [
  ["01", "Upload your resume", "Let AI analyze your skills"],
  ["02", "Discover opportunities", "See jobs that fit you"],
  ["03", "Build your future", "Get personalized guidance"],
];

function DashboardPreview() {
  const stats = [
    ["▣", "248", "Job Matches"],
    ["◉", "82%", "Avg Match"],
    ["↗", "+28%", "Market Growth"],
  ];

  const skills = [
    ["Python", 92],
    ["SQL", 85],
    ["AWS", 45],
  ];

  const bars = [25, 38, 31, 52, 43, 68, 55, 75, 68, 94];

  return (
    <div className="relative mx-auto w-full max-w-[650px] career-float">
      <div className="absolute -inset-12 rounded-full bg-violet-600/35 blur-[110px]" />

      <div className="relative rotate-[1deg] rounded-3xl border border-violet-400/40 bg-gradient-to-br from-[#35165C] via-[#24113F] to-[#180D2E] p-5 shadow-[0_0_80px_rgba(139,92,246,0.25)] sm:p-6">

        <div className="flex items-center justify-between border-b border-violet-200/15 pb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-violet-300">↗</span>
            <span className="font-bold text-white">Careerlytics</span>
          </div>

          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            ● AI Insights
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h3 className="font-bold text-white">Your Career Dashboard</h3>
          <span className="text-xs text-violet-200/60">Overview</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map(([icon, value, label]) => (
            <div
              key={label}
              className="rounded-xl border border-violet-300/15 bg-violet-300/[0.08] p-3"
            >
              <span className="text-xl text-fuchsia-300">{icon}</span>
              <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
                {value}
              </p>
              <p className="mt-1 text-[10px] text-violet-100/60 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.06] p-4">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-white">
                Skill Match Overview
              </span>
              <span className="text-xs text-fuchsia-300">82%</span>
            </div>

            <div className="mt-5 flex h-28 items-end gap-2">
              {bars.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-violet-700 via-purple-500 to-fuchsia-300"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>

            <div className="mt-3 flex justify-between text-[10px] text-violet-200/50">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.06] p-4">
            <p className="text-sm font-semibold text-white">Top Skills</p>

            {skills.map(([name, value]) => (
              <div key={name} className="mt-4">
                <div className="flex justify-between text-xs text-violet-100/80">
                  <span>{name}</span>
                  <span>{value}%</span>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -right-2 -top-7 hidden rounded-2xl border border-fuchsia-400/40 bg-[#32165B]/95 p-4 shadow-xl sm:block">
        <p className="text-xs text-violet-200/60">✦ New Match!</p>
        <p className="mt-1 text-sm font-bold text-white">
          Backend Developer
        </p>
        <p className="text-xs text-fuchsia-300">Remote · 92% match →</p>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-violet-400/40 bg-[#24113F]/95 p-4 shadow-xl sm:block">
        <p className="text-xs text-violet-200/60">Your skill match</p>
        <p className="mt-1 text-2xl font-bold text-fuchsia-300">92%</p>
      </div>
    </div>
  );
}

function CareerJourney() {
  return (
    <section className="relative grid items-center gap-8 overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-r from-[#32165B] via-[#24113F] to-[#35165C] p-6 shadow-[0_0_50px_rgba(139,92,246,0.15)] md:grid-cols-[1fr_1fr_0.9fr] md:p-9">

      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[100px]" />

      {/* Laptop illustration */}
      <div className="relative flex min-h-[210px] items-center justify-center">
        <div className="absolute h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />

        <div className="relative w-64">
          <div className="relative mx-auto flex h-36 w-48 items-center justify-center rounded-t-2xl border-4 border-violet-300/70 bg-gradient-to-br from-[#6335A0] to-[#24113F] shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <div className="w-36 rounded-lg border border-white/20 bg-[#211136] p-3">
              <div className="text-center text-xl text-fuchsia-300">↗</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="h-9 rounded bg-violet-400/50" />
                <div className="h-9 rounded bg-fuchsia-400/40" />
                <div className="h-9 rounded bg-purple-300/40" />
              </div>
            </div>
          </div>

          <div className="mx-auto h-3 w-60 rounded-b-xl bg-gradient-to-r from-violet-500 via-fuchsia-300 to-violet-500 shadow-[0_0_25px_rgba(168,85,247,0.6)]" />

          <span className="absolute -right-1 top-0 text-3xl">💼</span>
          <span className="absolute -left-5 top-9 text-3xl">📊</span>
          <span className="absolute right-4 -top-9 text-3xl">🎓</span>
        </div>
      </div>

      <div className="relative">
        <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-2 text-xs text-fuchsia-200">
          Simple · Smart · Powerful
        </span>

        <h2 className="mt-5 text-3xl font-bold text-white">
          Your career journey, simplified.
        </h2>

        <p className="mt-3 text-sm leading-6 text-violet-100/70">
          Upload your resume, explore matches, and take the next step with confidence.
        </p>

        <Link
          to="/register"
          className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:-translate-y-1"
        >
          Create Your Free Account →
        </Link>
      </div>

      <div className="relative space-y-5 border-l border-violet-300/20 pl-5">
        {steps.map(([number, title, description]) => (
          <div key={number} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-300/50 bg-violet-500/30 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              {number}
            </span>

            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="mt-1 text-xs text-violet-100/60">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <main className="relative -mt-6 min-h-screen overflow-hidden bg-[#160B2D] px-4 pb-12 pt-6 text-white sm:px-6">

      {/* Violet background effects */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-purple-700/40 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-72 h-[500px] w-[500px] rounded-full bg-fuchsia-600/30 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-700/25 blur-[130px]" />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Hero */}
        <section className="grid items-center gap-16 py-14 lg:min-h-[540px] lg:grid-cols-[0.95fr_1.05fr]">

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-violet-500/15 px-4 py-2 text-sm text-violet-200 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
              ✿ AI-Powered Career Intelligence
            </span>

            <h1 className="mt-7 text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[68px]">
              Your next career move starts with{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-purple-200 bg-clip-text text-transparent">
                better insights.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-7 text-violet-100/70">
              Discover opportunities, understand your skills, and get
              personalized recommendations to build the career you want.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 px-7 py-3.5 font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.45)] transition hover:-translate-y-1"
              >
                Get Started Free →
              </Link>

              <Link
                to="/analytics"
                className="rounded-xl border border-violet-300/40 bg-violet-400/[0.08] px-6 py-3.5 font-semibold text-white transition hover:bg-violet-400/15"
              >
                ▥ Explore Market Trends
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-7 border-t border-violet-200/15 pt-7">
              {[
                ["500K+", "Job Seekers"],
                ["10M+", "Job Listings"],
                ["92%", "Satisfaction"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-xs text-violet-200/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <DashboardPreview />
        </section>

        {/* Feature cards */}
        <section className="mt-8">
          <div className="text-center">
            <span className="rounded-full border border-violet-300/40 bg-violet-500/15 px-4 py-2 text-sm text-violet-200">
              Why Careerlytics?
            </span>

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                move forward
              </span>
            </h2>

            <p className="mt-2 text-sm text-violet-100/60">
              Turn job-market information into actionable career decisions.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.path}
                className="group block rounded-2xl border border-violet-300/25 bg-gradient-to-br from-[#32165B]/90 to-[#1B1035]/95 p-5 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-fuchsia-300/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/25 text-3xl text-violet-200 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    {feature.icon}
                  </span>

                  <span className="text-xl text-fuchsia-300 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-violet-100/60">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Career journey */}
        <div className="mt-10">
          <CareerJourney />
        </div>
      </div>
    </main>
  );
}
