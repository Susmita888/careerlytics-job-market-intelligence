
import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import JobCard from "../components/JobCard.jsx";

const ROLES = [
  "data scientist",
  "data analyst",
  "data engineer",
  "ml engineer",
  "backend developer",
  "full stack developer",
  "frontend developer",
  "devops engineer",
];

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10";

export default function Jobs() {
  const [f, setF] = useState({
    q: "",
    location: "",
    role: "",
    experience: "",
    skill: "",
  });

  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    items: [],
    total: 0,
    page_size: 20,
  });
  const [state, setState] = useState("loading");
  const [err, setErr] = useState("");

  const updateFilter = (key) => (e) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      setState("loading");
      setErr("");

      api
        .get("/jobs", {
          params: {
            ...Object.fromEntries(
              Object.entries(f).filter(([, value]) => value)
            ),
            page,
          },
          signal: controller.signal,
        })
        .then((response) => {
          setData(response.data);
          setState("ok");
        })
        .catch((error) => {
          if (
            error.code === "ERR_CANCELED" ||
            error.name === "CanceledError"
          ) {
            return;
          }

          setErr(errMsg(error));
          setState("error");
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [f, page]);

  const pages = Math.max(
    1,
    Math.ceil(data.total / (data.page_size || 20))
  );

  const activeFilters = Object.values(f).filter(Boolean).length;

  const clearFilters = () => {
    setF({
      q: "",
      location: "",
      role: "",
      experience: "",
      skill: "",
    });
    setPage(1);
  };

  const stats = [
    {
      label: "Available opportunities",
      value: data.total.toLocaleString(),
      icon: "▤",
      color: "text-violet-300",
      bg: "bg-violet-500/10",
    },
    {
      label: "Search experience",
      value: "Smart search",
      icon: "⌕",
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Career discovery",
      value: "Explore roles",
      icon: "✦",
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="min-h-screen space-y-7 rounded-3xl bg-[#090D1A] p-4 text-slate-100 sm:p-6 lg:p-8">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-[#302064] via-[#1A1D42] to-[#0D1729] p-6 sm:p-9">

        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-violet-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399]" />
            CAREER OPPORTUNITIES
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Discover opportunities.
            <span className="block bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Build your future.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Explore job opportunities, discover new career paths and find
            roles that align with your skills and ambitions.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="min-w-[145px] flex-1 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:flex-none"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xl ${item.color}`}>
                    {item.icon}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-3 text-xl font-bold text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111827] shadow-xl shadow-black/10">

        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg text-violet-300">⌕</span>
                <h2 className="text-lg font-bold text-white">
                  Find your perfect role
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Search by job title, location, experience or skills.
              </p>
            </div>

            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
              >
                Clear all filters ×
              </button>
            )}
          </div>

          <div className="relative mt-5">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-violet-300">
              ⌕
            </span>
            <input
              className={`${fieldClass} !py-4 !pl-12`}
              aria-label="Search jobs"
              placeholder="Search job titles, companies or keywords..."
              value={f.q}
              onChange={updateFilter("q")}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-cyan-300">⚙</span>
            <h3 className="text-sm font-semibold text-slate-200">
              Refine your search
            </h3>
            <span className="ml-auto rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">
              {activeFilters} active
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Location
              </label>
              <input
                className={fieldClass}
                aria-label="Location"
                placeholder="e.g. Kolkata"
                value={f.location}
                onChange={updateFilter("location")}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Job category
              </label>
              <select
                className={fieldClass}
                aria-label="Role"
                value={f.role}
                onChange={updateFilter("role")}
              >
                <option value="">All job roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Experience level
              </label>
              <select
                className={fieldClass}
                aria-label="Experience"
                value={f.experience}
                onChange={updateFilter("experience")}
              >
                <option value="">Any experience</option>
                <option value="Fresher">Fresher</option>
                <option value="Mid">Mid-level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Required skill
              </label>
              <input
                className={fieldClass}
                aria-label="Skill"
                placeholder="e.g. Python, SQL"
                value={f.skill}
                onChange={updateFilter("skill")}
              />
            </div>

          </div>
        </div>
      </section>

      {/* JOB RESULTS */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Explore opportunities
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Latest job openings
            </h2>

            <p className="mt-2 text-sm text-slate-400" aria-live="polite">
              {state === "ok"
                ? `${data.total.toLocaleString()} opportunities found`
                : state === "loading"
                  ? "Finding relevant opportunities..."
                  : "Your search results"}
            </p>
          </div>

          {state === "ok" && (
            <div className="rounded-xl border border-white/10 bg-[#111827] px-4 py-2.5 text-xs text-slate-300">
              Page <span className="font-bold text-white">{page}</span> of{" "}
              <span className="font-bold text-white">{pages}</span>
            </div>
          )}
        </div>

        {state === "loading" && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-white/10 bg-[#111827] p-6"
              >
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-4 h-3 w-1/3 rounded bg-white/5" />
                <div className="mt-7 h-3 w-full rounded bg-white/5" />
                <div className="mt-3 h-3 w-4/5 rounded bg-white/5" />
                <div className="mt-7 h-9 w-28 rounded-xl bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {state === "error" && (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6"
          >
            <p className="font-semibold text-red-300">
              Unable to load job opportunities
            </p>
            <p className="mt-2 text-sm text-red-200/80">
              {err}. Please check whether your backend API is running.
            </p>
            <button
              type="button"
              onClick={() => setPage((prev) => prev)}
              className="mt-4 rounded-xl border border-red-300/20 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/10"
            >
              Retry
            </button>
          </div>
        )}

        {state === "ok" && data.items.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-[#111827] px-5 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-3xl text-violet-300">
              ⌕
            </div>
            <h3 className="mt-5 text-lg font-bold text-white">
              No matching jobs found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Try different keywords or broaden your filters to discover more
              opportunities.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Reset search filters
            </button>
          </div>
        )}

        {state === "ok" && data.items.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {data.items.map((job) => (
              <div
                key={job.id}
                className="group rounded-[22px] border border-white/[0.08] bg-[#111827] p-1 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-950/20"
              >
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PAGINATION */}
      {state === "ok" && pages > 1 && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#111827] p-4 sm:px-6">
          <p className="text-xs text-slate-400">
            Showing page <span className="font-semibold text-white">{page}</span>{" "}
            of <span className="font-semibold text-white">{pages}</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              ← Previous
            </button>

            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={page >= pages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
