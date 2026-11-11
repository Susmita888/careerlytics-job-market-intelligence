
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link, NavLink } from "react-router-dom";
import api, { errMsg } from "../api";
import JobCard from "../components/JobCard.jsx";

const navigation = [
  { label: "Overview", path: "/dashboard", icon: "◫" },
  { label: "Find Jobs", path: "/jobs", icon: "⌕" },
  { label: "Market Insights", path: "/analytics", icon: "▥" },
  { label: "My Resume", path: "/resume", icon: "▤" },
  { label: "AI Matches", path: "/recommendations", icon: "✦" },
  { label: "Skill Gap", path: "/skill-gap", icon: "◎" },
  { label: "Learning Roadmap", path: "/roadmap", icon: "⌁" },
];

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

function getScore(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(value <= 1 ? value * 100 : value))
  );
}

function StatCard({ label, value, detail, icon, accent }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:-translate-y-1 hover:border-violet-400/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${accent}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
      </div>

      {action}
    </div>
  );
}

// --------------------------------------------------
// SKILL CATEGORIES
// --------------------------------------------------

const SKILL_CATEGORIES = [
  {
    name: "Programming",
    color: "#8b5cf6",
    skills: [
      "python",
      "java",
      "c",
      "c++",
      "c#",
      "javascript",
      "typescript",
      "go",
      "rust",
      "php",
      "ruby",
    ],
  },
  {
    name: "Data Science & ML",
    color: "#06b6d4",
    skills: [
      "machine learning",
      "deep learning",
      "llm",
      "hugging face",
      "pandas",
      "numpy",
      "matplotlib",
      "seaborn",
      "scikit-learn",
      "tensorflow",
      "pytorch",
      "nlp",
      "statistics",
      "excel",
      "power bi",
    ],
  },
  {
    name: "Databases",
    color: "#10b981",
    skills: [
      "sql",
      "mysql",
      "postgresql",
      "mongodb",
      "sqlite",
      "oracle",
      "redis",
    ],
  },
  {
    name: "Cloud & DevOps",
    color: "#f59e0b",
    skills: [
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "linux",
      "git",
      "ci/cd",
      "jenkins",
    ],
  },
  {
    name: "Web Development",
    color: "#ec4899",
    skills: [
      "html",
      "css",
      "react",
      "node.js",
      "angular",
      "vue",
      "fastapi",
      "django",
      "flask",
    ],
  },
];

function categorizeSkills(skills = []) {
  const normalizedSkills = skills.map((skill) => ({
    original: skill,
    normalized: skill.trim().toLowerCase(),
  }));

  const categorized = SKILL_CATEGORIES.map((category) => {
    const matchedSkills = normalizedSkills.filter((skill) =>
      category.skills.includes(skill.normalized)
    );

    return {
      name: category.name,
      value: matchedSkills.length,
      color: category.color,
      skills: matchedSkills.map((skill) => skill.original),
    };
  }).filter((category) => category.value > 0);

  // Keep skills that do not match predefined categories.
  const knownSkills = new Set(
    SKILL_CATEGORIES.flatMap((category) => category.skills)
  );

  const otherSkills = normalizedSkills
    .filter((skill) => !knownSkills.has(skill.normalized))
    .map((skill) => skill.original);

  if (otherSkills.length > 0) {
    categorized.push({
      name: "Other Skills",
      value: otherSkills.length,
      color: "#94a3b8",
      skills: otherSkills,
    });
  }

  return categorized;
}

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState([]);

  const [skill, setSkill] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("0");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Interactive chart selection
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --------------------------------------------------
  // LOAD RECOMMENDATIONS
  // --------------------------------------------------

  const loadRecs = () =>
    api
      .get("/recommendations", { params: { limit: 3 } })
      .then((r) => setRecs(r.data))
      .catch(() => setRecs([]));

  // --------------------------------------------------
  // LOAD PROFILE AND RECOMMENDATIONS
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get("/profile"),
      api
        .get("/recommendations", { params: { limit: 3 } })
        .catch(() => ({ data: [] })),
    ])
      .then(([profileResponse, recommendationResponse]) => {
        if (!active) return;

        const data = profileResponse.data;

        setProfile(data);
        setTargetRole(data.target_role || "");
        setExperience(String(data.experience_years ?? 0));
        setRecs(recommendationResponse.data || []);
      })
      .catch((e) => {
        if (active) setMsg(errMsg(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const save = async (next) => {
    try {
      const updated = (await api.put("/profile", next)).data;

      setProfile(updated);
      setTargetRole(updated.target_role || "");
      setExperience(String(updated.experience_years ?? 0));

      setMsg("Profile updated successfully.");

      await loadRecs();
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  // --------------------------------------------------
  // ADD SKILL
  // --------------------------------------------------

  const addSkill = async (e) => {
    e.preventDefault();

    const value = skill.trim();

    if (!value) return;

    if (
      profile.skills.some(
        (s) => s.toLowerCase() === value.toLowerCase()
      )
    ) {
      setMsg("This skill is already in your profile.");
      return;
    }

    await save({
      ...profile,
      skills: [...profile.skills, value],
    });

    setSkill("");
  };

  // --------------------------------------------------
  // REMOVE SKILL
  // --------------------------------------------------

  const removeSkill = (value) => {
    save({
      ...profile,
      skills: profile.skills.filter((s) => s !== value),
    });
  };

  // --------------------------------------------------
  // SAVE TARGET ROLE
  // --------------------------------------------------

  const saveRole = () => {
    if (targetRole !== (profile.target_role || "")) {
      save({
        ...profile,
        target_role: targetRole,
      });
    }
  };

  // --------------------------------------------------
  // SAVE EXPERIENCE
  // --------------------------------------------------

  const saveExperience = () => {
    const years = Math.max(
      0,
      Math.min(50, Number(experience) || 0)
    );

    setExperience(String(years));

    if (years !== Number(profile.experience_years || 0)) {
      save({
        ...profile,
        experience_years: years,
      });
    }
  };

  // --------------------------------------------------
  // RECOMMENDATION SCORES
  // --------------------------------------------------

  const scoredRecs = useMemo(
    () =>
      recs.map((rec) => ({
        ...rec,
        scorePercent: getScore(rec.score),
      })),
    [recs]
  );

  const averageScore = useMemo(() => {
    const scores = scoredRecs
      .map((rec) => rec.scorePercent)
      .filter((score) => score !== null);

    return scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) /
            scores.length
        )
      : null;
  }, [scoredRecs]);

  // --------------------------------------------------
  // SKILL DISTRIBUTION
  // --------------------------------------------------

  const skillDistribution = useMemo(
    () => categorizeSkills(profile?.skills || []),
    [profile?.skills]
  );

  const totalSkills = profile?.skills?.length || 0;

  const selectedCategoryData = skillDistribution.find(
    (category) => category.name === selectedCategory
  );

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-[#090D1A] text-slate-300">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />

          Loading your Careerlytics dashboard...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PROFILE ERROR STATE
  // --------------------------------------------------

  if (!profile) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-[#111827] p-8 text-center text-rose-300">
        {msg || "Unable to load your profile. Please refresh the page."}
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN DASHBOARD UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen rounded-3xl bg-[#090D1A] text-slate-100">
      <div className="flex flex-col lg:flex-row">

        {/* SIDEBAR */}

        <aside className="w-full shrink-0 border-b border-white/10 bg-[#0D1323] p-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
          <Link to="/" className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold shadow-lg shadow-violet-500/20">
              C
            </div>

            <div>
              <p className="text-lg font-bold text-white">
                Career<span className="text-violet-400">lytics</span>
              </p>

              <p className="text-[10px] tracking-[0.2em] text-slate-500">
                CAREER INTELLIGENCE
              </p>
            </div>
          </Link>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            WORKSPACE
          </p>

          <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={navClass}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-4 lg:block">
            <span className="text-xl">✦</span>

            <h3 className="mt-3 text-sm font-semibold text-white">
              Keep growing
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Discover skill gaps and build a learning plan for your career goals.
            </p>

            <Link
              to="/roadmap"
              className="mt-4 inline-block text-xs font-semibold text-violet-300 hover:text-violet-200"
            >
              Explore roadmap →
            </Link>
          </div>
        </aside>

        {/* MAIN DASHBOARD */}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">

          {/* HEADER */}

          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                Your workspace / Overview
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome back!
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Track your progress and discover your next career opportunity.
              </p>
            </div>

            <Link
              to="/recommendations"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500"
            >
              ✦ Explore AI matches
            </Link>
          </header>

          {/* WELCOME PANEL */}

          <section className="relative mb-7 overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#29205B] via-[#171B3B] to-[#101729] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-violet-200">
                  YOUR CAREER COMMAND CENTER
                </span>

                <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
                  Build your next career move.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Your profile, skills and AI-powered job matches come together
                  here. Keep learning and move closer to your target role.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/skill-gap"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Analyze skills →
                </Link>

                <Link
                  to="/resume"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  My resume →
                </Link>
              </div>
            </div>
          </section>

          {/* STATISTICS */}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Profile skills"
              value={profile.skills.length}
              detail="Skills in your profile"
              icon="✦"
              accent="bg-violet-500/15 text-violet-300"
            />

            <StatCard
              label="Job recommendations"
              value={recs.length}
              detail="Top matches currently loaded"
              icon="⌕"
              accent="bg-cyan-500/10 text-cyan-300"
            />

            <StatCard
              label="Average match"
              value={averageScore === null ? "—" : `${averageScore}%`}
              detail="Average of available match scores"
              icon="◎"
              accent="bg-emerald-500/10 text-emerald-300"
            />

            <StatCard
              label="Experience"
              value={`${profile.experience_years ?? 0} yrs`}
              detail="Professional experience"
              icon="◷"
              accent="bg-amber-500/10 text-amber-300"
            />
          </section>

          {/* ANALYTICS AND PROFILE */}

          <div className="mb-8 grid gap-6 xl:grid-cols-5">

            {/* MATCH ANALYTICS */}

            <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6 xl:col-span-3">
              <SectionTitle
                eyebrow="Performance overview"
                title="Your job match analytics"
                action={
                  <Link
                    to="/recommendations"
                    className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                  >
                    All matches →
                  </Link>
                }
              />

              {scoredRecs.some(
                (rec) => rec.scorePercent !== null
              ) ? (
                <div className="space-y-6">
                  {scoredRecs
                    .filter((rec) => rec.scorePercent !== null)
                    .map((rec) => (
                      <div key={rec.job.id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-200">
                              {rec.job.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {rec.job.company || "Company not listed"}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-bold text-violet-300">
                            {rec.scorePercent}%
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[#080D19]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-700"
                            style={{
                              width: `${rec.scorePercent}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-slate-300">
                    Match analytics will appear when recommendation scores are available.
                  </p>

                  <Link
                    to="/recommendations"
                    className="mt-3 inline-block text-sm font-semibold text-violet-300"
                  >
                    Explore recommendations →
                  </Link>
                </div>
              )}

              {averageScore !== null && (
                <div className="mt-7 rounded-xl border border-violet-400/10 bg-violet-500/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">
                        Average recommendation score
                      </p>

                      <p className="mt-1 text-2xl font-bold text-white">
                        {averageScore}%
                      </p>
                    </div>

                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-violet-400/30 text-sm font-bold text-violet-300"
                      style={{
                        background: `conic-gradient(#8b5cf6 ${averageScore * 3.6}deg, #263044 0deg)`,
                      }}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111827]">
                        {averageScore}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* CAREER PROFILE */}

            <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6 xl:col-span-2">
              <SectionTitle
                eyebrow="Personal workspace"
                title="Career profile"
              />

              <label className="block text-sm font-medium text-slate-300">
                Target role

                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onBlur={saveRole}
                  placeholder="e.g. Data Scientist"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/60"
                />
              </label>

              <label className="mt-5 block text-sm font-medium text-slate-300">
                Years of experience

                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  onBlur={saveExperience}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
                />
              </label>

              {msg && (
                <p
                  aria-live="polite"
                  className="mt-4 text-xs text-emerald-300"
                >
                  {msg}
                </p>
              )}

              <div className="mt-6 rounded-xl border border-white/10 bg-[#0B1120] p-4">
                <p className="text-xs text-slate-500">
                  Current career goal
                </p>

                <p className="mt-2 font-semibold text-white">
                  {profile.target_role || "Set your target role"}
                </p>

                <Link
                  to="/roadmap"
                  className="mt-3 inline-block text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  View personalized roadmap →
                </Link>
              </div>
            </section>
          </div>

          {/* INTERACTIVE SKILLS DISTRIBUTION */}

          <section className="mb-8 rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
            <SectionTitle
              eyebrow="Skills intelligence"
              title="Your skills distribution"
              action={
                <span className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300">
                  {totalSkills} total skills
                </span>
              }
            />

            {skillDistribution.length > 0 ? (
              <>
                <div className="grid items-center gap-6 lg:grid-cols-2">

                  {/* DOUGHNUT CHART */}

                  <div className="relative h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={skillDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="58%"
                          outerRadius="82%"
                          paddingAngle={4}
                          stroke="none"
                          onClick={(data) => {
                            const categoryName =
                              data?.name || data?.payload?.name;

                            if (categoryName) {
                              setSelectedCategory((current) =>
                                current === categoryName
                                  ? null
                                  : categoryName
                              );
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {skillDistribution.map((category) => (
                            <Cell
                              key={category.name}
                              fill={category.color}
                              opacity={
                                selectedCategory &&
                                selectedCategory !== category.name
                                  ? 0.35
                                  : 1
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #8b5cf6",
                            borderRadius: "12px",
                            color: "#ffffff",
                            padding: "12px",
                          }}
                          itemStyle={{
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                          labelStyle={{
                            color: "#c4b5fd",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                          formatter={(value, name) => [
                            `${value} skills`,
                            name,
                          ]}
                        />
                  
                      </PieChart>
                    </ResponsiveContainer>

                    {/* CENTER LABEL */}

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-white">
                          {selectedCategoryData
                            ? selectedCategoryData.value
                            : totalSkills}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {selectedCategoryData
                            ? "Selected skills"
                            : "Total skills"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CLICKABLE CATEGORY BREAKDOWN */}

                  <div className="space-y-3">
                    {skillDistribution.map((category) => {
                      const percentage =
                        totalSkills > 0
                          ? Math.round(
                              (category.value / totalSkills) * 100
                            )
                          : 0;

                      const isSelected =
                        selectedCategory === category.name;

                      return (
                        <button
                          type="button"
                          key={category.name}
                          onClick={() =>
                            setSelectedCategory((current) =>
                              current === category.name
                                ? null
                                : category.name
                            )
                          }
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-violet-400/40 bg-violet-500/10"
                              : "border-transparent hover:border-white/10 hover:bg-white/5"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: category.color,
                                }}
                              />

                              <span className="text-sm font-medium text-slate-200">
                                {category.name}
                              </span>
                            </div>

                            <span className="text-xs font-semibold text-slate-300">
                              {category.value} ({percentage}%)
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-[#080D19]">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: category.color,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-[11px] text-slate-500">
                            {isSelected
                              ? "Click again to deselect"
                              : "Click to explore skills"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTED CATEGORY SKILLS */}

                {selectedCategoryData && (
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                          Selected category
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-white">
                          {selectedCategoryData.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {selectedCategoryData.value} skills in this category
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                      >
                        Clear selection ×
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryData.skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedCategoryData && (
                  <p className="mt-5 text-center text-xs text-slate-500">
                    Select a chart segment or category to explore your skills.
                  </p>
                )}
              </>
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                Add skills to your profile to see your skills distribution.
              </p>
            )}
          </section>

          {/* SKILLS INVENTORY */}

          <section className="mb-8 rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
            <SectionTitle
              eyebrow="Your capabilities"
              title="Skills inventory"
              action={
                <Link
                  to="/skill-gap"
                  className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  Analyze skill gaps →
                </Link>
              }
            />

            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200"
                  >
                    {s}

                    <button
                      type="button"
                      aria-label={`Remove ${s}`}
                      onClick={() => removeSkill(s)}
                      className="text-violet-300 transition hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No skills added yet. Add your first skill below.
              </p>
            )}

            <form
              onSubmit={addSkill}
              className="mt-5 flex flex-wrap gap-2"
            >
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Add a skill (e.g. Python, SQL, React)"
                aria-label="Add skill"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/60"
              />

              <button
                type="submit"
                className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                + Add skill
              </button>
            </form>
          </section>

          {/* TOP JOB RECOMMENDATIONS */}

          <section>
            <SectionTitle
              eyebrow="Selected for you"
              title="Top job recommendations"
              action={
                <Link
                  to="/recommendations"
                  className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  View all →
                </Link>
              }
            />

            {recs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                  ✦
                </div>

                <h3 className="mt-4 font-semibold text-white">
                  Your matches are waiting
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Add skills or upload your resume to discover relevant opportunities.
                </p>

                <Link
                  to="/resume"
                  className="mt-5 inline-flex rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400"
                >
                  Upload resume
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {recs.map((r) => (
                  <div
                    key={r.job.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-1 transition hover:border-violet-400/30"
                  >
                    <JobCard job={r.job} rec={r} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* FOOTER */}

          <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-600">
            Careerlytics · Your AI-powered career intelligence platform
          </footer>
        </main>
      </div>
    </div>
  );
}
