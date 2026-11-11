
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api, { errMsg } from "../api";

// --------------------------------------------------
// ROLE FILTER OPTIONS
// --------------------------------------------------

const ROLES = [
  { value: "", label: "All job roles" },
  { value: "data scientist", label: "Data Scientist" },
  { value: "data analyst", label: "Data Analyst" },
  { value: "data engineer", label: "Data Engineer" },
  { value: "ml engineer", label: "Machine Learning Engineer" },
  { value: "backend developer", label: "Backend Developer" },
  { value: "frontend developer", label: "Frontend Developer" },
  { value: "full stack developer", label: "Full Stack Developer" },
  { value: "Data Science", label: "Data Science (All)" },
  { value: "Software Development", label: "Software Development" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Cloud and DevOps", label: "Cloud and DevOps" },
  { value: "Testing and QA", label: "Testing and QA" },
  { value: "IT Support", label: "IT Support" },
  { value: "Marketing & Communications", label: "Marketing & Communications" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Finance & Accounting", label: "Finance & Accounting" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Legal", label: "Legal" },
  { value: "Engineering", label: "Engineering" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Hospitality & Services", label: "Hospitality & Services" },
  { value: "Fitness & Wellness", label: "Fitness & Wellness" },
  { value: "Education & Training", label: "Education & Training" },
  { value: "Media & Entertainment", label: "Media & Entertainment" },
  { value: "Manufacturing & Production", label: "Manufacturing & Production" },
  { value: "Administration", label: "Administration" },
  { value: "Sales & Marketing", label: "Sales & Marketing" },
  { value: "Other", label: "Other" },
];

// --------------------------------------------------
// ROLE NAME NORMALIZATION
// --------------------------------------------------

const ROLE_NAMES = {
  administration: "Administration",
  cloudanddevops: "Cloud and DevOps",
  customersupport: "Customer Support",
  cybersecurity: "Cybersecurity",
  datascience: "Data Science",
  dataanalyst: "Data Analyst",
  dataengineer: "Data Engineer",
  datascientist: "Data Scientist",
  educationtraining: "Education & Training",
  engineering: "Engineering",
  financeaccounting: "Finance & Accounting",
  fitnesswellness: "Fitness & Wellness",
  healthcare: "Healthcare",
  hospitalityservices: "Hospitality & Services",
  humanresources: "Human Resources",
  itsupport: "IT Support",
  legal: "Legal",
  manufacturingproduction: "Manufacturing & Production",
  marketingcommunications: "Marketing & Communications",
  mediaentertainment: "Media & Entertainment",
  other: "Other",
  salesmarketing: "Sales & Marketing",
  salesandmarketing: "Sales & Marketing",
  softwaredevelopment: "Software Development",
  testingandqa: "Testing and QA",
  backenddeveloper: "Backend Developer",
  frontenddeveloper: "Frontend Developer",
  fullstackdeveloper: "Full Stack Developer",
  machinelearningengineer: "Machine Learning Engineer",
  mlengineer: "Machine Learning Engineer",
  devopsengineer: "DevOps Engineer",
};

function formatRole(role) {
  if (!role) return "Other";

  const normalized = String(role)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return ROLE_NAMES[normalized] || String(role).trim();
}

// --------------------------------------------------
// CHART LABEL FORMATTING
// --------------------------------------------------

function formatChartLabel(value) {
  return formatRole(value)
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s+/g, " ")
    .trim();
}

function RoleAxisTick({ x, y, payload }) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="#94A3B8"
      fontSize={11}
    >
      {formatChartLabel(payload.value)}
    </text>
  );
}

// --------------------------------------------------
// GROUP DUPLICATE ROLE COUNTS
// --------------------------------------------------

function normalizeRoleCounts(items) {
  const grouped = {};

  (items || []).forEach((item) => {
    const role = formatRole(item.role);

    if (!grouped[role]) {
      grouped[role] = {
        role,
        jobs: 0,
      };
    }

    grouped[role].jobs += Number(item.jobs || 0);
  });

  return Object.values(grouped).sort(
    (a, b) => b.jobs - a.jobs
  );
}

// --------------------------------------------------
// CHART STYLES
// --------------------------------------------------

const tick = {
  fontSize: 11,
  fill: "#94A3B8",
};

const tooltipStyle = {
  backgroundColor: "#151D30",
  border: "1px solid #334155",
  borderRadius: "12px",
  color: "#F8FAFC",
};

// --------------------------------------------------
// REUSABLE CHART CARD
// --------------------------------------------------

function ChartCard({
  title,
  subtitle,
  tag,
  children,
  chartHeight = "h-[280px]",
}) {
  return (
    <section className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111827] p-5 transition-all duration-300 hover:border-violet-400/20 hover:shadow-xl hover:shadow-violet-950/10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {subtitle}
          </p>
        </div>

        {tag && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {tag}
          </span>
        )}
      </div>

      <div className={`mt-6 ${chartHeight} w-full`}>
        {children}
      </div>
    </section>
  );
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  color,
  background,
  description,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111827] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:shadow-xl hover:shadow-violet-950/10">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/[0.06] blur-2xl transition group-hover:bg-violet-500/[0.12]" />

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-400 sm:text-sm">
          {label}
        </p>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${background} ${color}`}
        >
          {icon}
        </div>
      </div>

      <p className="relative mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {value ?? "—"}
      </p>

      <p className="relative mt-2 text-[11px] text-slate-500">
        {description}
      </p>
    </div>
  );
}

// --------------------------------------------------
// MAIN ANALYTICS COMPONENT
// --------------------------------------------------

export default function Analytics() {
  const [role, setRole] = useState("");

  const [d, setD] = useState({
    sk: [],
    s: [],
    l: [],
    t: [],
    r: [],
    o: null,
  });

  const [err, setErr] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ------------------------------------------------
  // LOAD GENERAL ANALYTICS
  // ------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setAnalyticsLoading(true);
        setErr("");

        const [
          overview,
          salaries,
          locations,
          trends,
          roles,
        ] = await Promise.all([
          api.get("/analytics/overview"),
          api.get("/analytics/salaries"),
          api.get("/analytics/locations"),
          api.get("/analytics/trends"),
          api.get("/analytics/roles"),
        ]);

        if (cancelled) return;

        const salaryData = (salaries.data || []).map((item) => {
          const median = Number(item.median);

          return {
            ...item,
            role: formatRole(item.role),
            lakh:
              Number.isFinite(median) && median > 0
                ? Number((median / 100000).toFixed(2))
                : 0,
          };
        });

        const locationData = locations.data || [];
        const trendData = trends.data || [];
        const roleData = normalizeRoleCounts(roles.data);

        setD((prev) => ({
          ...prev,
          o: overview.data,
          s: salaryData,
          l: locationData,
          t: trendData,
          r: roleData,
        }));
      } catch (error) {
        if (!cancelled) {
          setErr(errMsg(error));
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------
  // LOAD SKILLS BASED ON SELECTED ROLE
  // ------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      setSkillsLoading(true);
      setSkillsError("");

      try {
        const response = await api.get("/analytics/skills", {
          params: {
            role: role || undefined,
            limit: 12,
          },
        });

        if (!cancelled) {
          setD((prev) => ({
            ...prev,
            sk: response.data || [],
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setSkillsError(errMsg(error));

          setD((prev) => ({
            ...prev,
            sk: [],
          }));
        }
      } finally {
        if (!cancelled) {
          setSkillsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      cancelled = true;
    };
  }, [role]);

  // ------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------

  if (err) {
    return (
      <div className="min-h-[50vh] rounded-3xl bg-[#090D1A] p-5 text-slate-100 sm:p-8">
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6">
          <h2 className="font-bold text-red-300">
            Unable to load market analytics
          </h2>

          <p className="mt-2 text-sm text-red-200/80">
            {err}
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Please check that your backend API is running.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------

  if (analyticsLoading || !d.o) {
    return (
      <div className="min-h-[60vh] space-y-6 rounded-3xl bg-[#090D1A] p-4 text-slate-100 sm:p-8">
        <div className="h-48 animate-pulse rounded-3xl bg-[#171B35]" />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-[#111827]"
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl bg-[#111827]"
            />
          ))}
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // OVERVIEW STATISTICS
  // ------------------------------------------------

  const stats = [
    {
      label: "Total job listings",
      value: d.o.total_jobs?.toLocaleString(),
      icon: "▤",
      color: "text-violet-300",
      background: "bg-violet-500/10",
      description: "Opportunities in your dataset",
    },
    {
      label: "Companies",
      value: d.o.companies?.toLocaleString(),
      icon: "▣",
      color: "text-cyan-300",
      background: "bg-cyan-500/10",
      description: "Organizations represented",
    },
    {
      label: "Cities covered",
      value: d.o.cities?.toLocaleString(),
      icon: "◎",
      color: "text-emerald-300",
      background: "bg-emerald-500/10",
      description: "Hiring locations available",
    },
    {
      label: "Fresher-friendly",
      value:
        d.o.fresher_friendly_pct != null
          ? `${d.o.fresher_friendly_pct}%`
          : "—",
      icon: "✦",
      color: "text-amber-300",
      background: "bg-amber-500/10",
      description: "Listings suitable for freshers",
    },
  ];

  const hasSyntheticData = (d.o.synthetic_jobs || 0) > 0;

  // ------------------------------------------------
  // DASHBOARD UI
  // ------------------------------------------------

  return (
    <div className="min-h-screen space-y-7 rounded-3xl bg-[#090D1A] p-4 text-slate-100 sm:p-6 lg:p-8">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-[#302064] via-[#1A1D42] to-[#0D1729] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22D3EE]" />
            CAREER INTELLIGENCE
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Understand the market.
            <span className="block bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Make smarter moves.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Explore hiring trends, understand salary patterns and discover
            the skills companies are looking for. Turn job-market data into
            better career decisions.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <span className="text-lg text-violet-300">◈</span>
              <div>
                <p className="text-sm font-bold text-white">
                  Market overview
                </p>
                <p className="text-[10px] text-slate-400">
                  Jobs and hiring activity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <span className="text-lg text-cyan-300">⌁</span>
              <div>
                <p className="text-sm font-bold text-white">
                  Data insights
                </p>
                <p className="text-[10px] text-slate-400">
                  Skills and salary patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DATA NOTICE */}

      {hasSyntheticData && (
        <div className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4">
          <span className="text-xl text-amber-300">ⓘ</span>
          <div>
            <p className="text-sm font-semibold text-amber-200">
              {d.o.demo_only
                ? "You're viewing demo data"
                : "This dataset includes sample records"}
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-100/70">
              {d.o.demo_only
                ? "All records in this dataset are generated sample data, not verified live vacancies."
                : `${Number(d.o.synthetic_jobs || 0).toLocaleString()} generated sample records are included in this dataset. Other records come from your imported data sources. Treat sample records separately when interpreting market insights.`}
            </p>
          </div>
        </div>
      )}

      {/* STATISTICS */}

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Market at a glance
            </p>

            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              Market overview
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-[#111827] px-3 py-2 text-[10px] text-slate-400">
            DATA SUMMARY
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      {/* ANALYTICS */}

      <section>
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            Data-driven insights
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Explore market analytics
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Understand which skills are in demand, compare salary levels
            across roles and discover where hiring activity is concentrated.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">

          {/* SKILLS */}

          <ChartCard
            title="Most requested skills"
            subtitle="Skills frequently mentioned in job descriptions"
            tag="Skills demand"
          >
            <div className="mb-3">
              <select
                className="w-full max-w-xs rounded-xl border border-white/10 bg-[#0B1120] px-4 py-2.5 text-xs text-white outline-none transition focus:border-violet-400/60"
                aria-label="Filter skills by role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {skillsLoading ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                Loading skill insights...
              </div>
            ) : skillsError ? (
              <div className="flex h-[220px] items-center justify-center px-5 text-center text-sm text-red-300">
                Unable to load skills: {skillsError}
              </div>
            ) : d.sk.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                No skill data available for this role.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="82%">
                <BarChart
                  data={d.sk}
                  layout="vertical"
                  margin={{ left: 15, right: 15, top: 5 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#263248"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                    domain={[0, "auto"]}
                    tick={tick}
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals
                  />

                  <YAxis
                    type="category"
                    dataKey="skill"
                    tick={tick}
                    width={105}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`, "Share of jobs"]}
                  />

                  <Bar
                    dataKey="share_pct"
                    name="Share of jobs"
                    fill="#8B5CF6"
                    radius={[0, 7, 7, 0]}
                    barSize={17}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* SALARIES */}

          <ChartCard
            title="Median salary by role"
            subtitle={`Salary in lakhs per year · Coverage: ${d.o.salary_coverage_pct ?? "—"}%`}
            tag="Salary insights"
          >
            {d.s.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={d.s}
                  layout="vertical"
                  margin={{ left: 15, right: 15, top: 5 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#263248"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}L`}
                  />

                  <YAxis
                    type="category"
                    dataKey="role"
                    tick={RoleAxisTick}
                    width={165}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      `₹${Number(value).toFixed(2)} LPA`,
                      "Median salary",
                    ]}
                  />

                  <Bar
                    dataKey="lakh"
                    name="Median salary"
                    fill="#22D3EE"
                    radius={[0, 7, 7, 0]}
                    barSize={19}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No salary data available.
              </div>
            )}
          </ChartCard>

          {/* ROLE CATEGORIES */}

          <ChartCard
            title="Most common role categories"
            subtitle={`Distribution of job listings · Showing top ${Math.min(d.r.length, 10)} of ${d.r.length} categories`}
            tag="Role distribution"
            chartHeight="h-[360px]"
          >
            {d.r.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={d.r.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 15, right: 15, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#263248"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="role"
                    tick={RoleAxisTick}
                    width={165}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      Number(value).toLocaleString(),
                      "Job listings",
                    ]}
                  />

                  <Bar
                    dataKey="jobs"
                    name="Job listings"
                    fill="#A78BFA"
                    radius={[0, 7, 7, 0]}
                    barSize={19}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No role category data available.
              </div>
            )}
          </ChartCard>

          {/* LOCATIONS */}

          <ChartCard
            title="Jobs by city"
            subtitle="Cities with the highest number of job listings"
            tag="Location insights"
          >
            {d.l.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={d.l}
                  margin={{ top: 10, right: 12, bottom: 30, left: -12 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#263248"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="location"
                    tick={tick}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={55}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Bar
                    dataKey="jobs"
                    name="Job listings"
                    fill="#A78BFA"
                    radius={[7, 7, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No location data available.
              </div>
            )}
          </ChartCard>

          {/* HIRING TRENDS */}

          <ChartCard
            title="Job postings over time"
            subtitle="Monthly job-posting activity in your dataset"
            tag="Hiring trends"
          >
            {d.t.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={d.t}
                  margin={{ top: 10, right: 15, left: -12 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#263248"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Line
                    type="monotone"
                    dataKey="jobs"
                    name="Job postings"
                    stroke="#22D3EE"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#22D3EE", strokeWidth: 0 }}
                    activeDot={{
                      r: 6,
                      fill: "#22D3EE",
                      stroke: "#151D30",
                      strokeWidth: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl">
                  📊
                </div>

                <h3 className="text-sm font-semibold text-white">
                  Limited historical data
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
                  {d.t.length === 1
                    ? `Only one month of verified posting data is available (${d.t[0].month}). More historical records are needed to show a meaningful hiring trend.`
                    : "Verified posting dates are unavailable for most imported jobs. More historical records are needed to display hiring trends."}
                </p>

                <span className="mt-4 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-3 py-1.5 text-[10px] font-medium text-amber-200">
                  Historical data coverage is limited
                </span>
              </div>
            )}
          </ChartCard>
        </div>
      </section>

      {/* FOOTER NOTE */}

      <div className="rounded-2xl border border-white/[0.07] bg-[#111827]/70 p-4">
        <p className="text-xs leading-6 text-slate-400">
          <span className="font-semibold text-slate-300">
            About these insights:
          </span>{" "}
          Market statistics and charts are based on the data supplied by your
          Careerlytics analytics API. Salary figures depend on available
          salary records, and historical trends depend on the collection
          period of your dataset. Sample records, where present, are identified
          separately from imported records.
        </p>
      </div>
    </div>
  );
}
