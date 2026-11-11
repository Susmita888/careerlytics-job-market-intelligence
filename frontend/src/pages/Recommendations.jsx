
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import JobCard from "../components/JobCard.jsx";

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [gap, setGap] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [gapLoading, setGapLoading] = useState(true);
  const [error, setError] = useState("");
  const [gapError, setGapError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/recommendations", {
        params: {
          limit: 30,
          ...(location.trim() ? { location: location.trim() } : {}),
        },
      });

      setRecs(response.data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [location]);

  const loadSkillGap = useCallback(async () => {
    setGapLoading(true);
    setGapError("");

    try {
      const response = await api.get("/skills/gap");
      setGap(response.data);
    } catch (e) {
      setGapError(errMsg(e));
    } finally {
      setGapLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations, refreshKey]);

  useEffect(() => {
    loadSkillGap();
  }, [loadSkillGap, refreshKey]);

  const averageScore =
    recs.length > 0
      ? recs.reduce((sum, item) => sum + item.score, 0) / recs.length
      : 0;

  const totalMatchedSkills = new Set(
    recs.flatMap((item) => item.matched_skills || [])
  ).size;

  const totalMissingSkills = new Set(
    recs.flatMap((item) => item.missing_skills || [])
  ).size;

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#241044] via-[#32105A] to-[#17102E] p-6 text-white shadow-xl sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-white/10 px-3 py-1 text-xs font-semibold text-violet-200">
            ✦ AI CAREER INTELLIGENCE
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Find jobs that match your potential.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/75 sm:text-base">
            Discover opportunities ranked against your profile, understand
            your strengths, and identify the skills you need to grow.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/resume"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-900 transition hover:bg-violet-100"
            >
              Update my resume →
            </Link>

            <button
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={loading || gapLoading}
              className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              ↻ Refresh matches
            </button>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel">
          <p className="text-sm text-muted">Recommended jobs</p>
          <p className="mt-2 text-3xl font-bold text-brand">
            {loading ? "—" : recs.length}
          </p>
          <p className="mt-1 text-xs text-muted">Opportunities ranked for you</p>
        </div>

        <div className="panel">
          <p className="text-sm text-muted">Average match score</p>
          <p className="mt-2 text-3xl font-bold text-match">
            {loading ? "—" : `${averageScore.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-muted">Across loaded recommendations</p>
        </div>

        <div className="panel">
          <p className="text-sm text-muted">Unique matched skills</p>
          <p className="mt-2 text-3xl font-bold text-brand">
            {loading ? "—" : totalMatchedSkills}
          </p>
          <p className="mt-1 text-xs text-muted">
            {loading ? "Loading..." : `${totalMissingSkills} unique skills to explore`}
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="grid items-start gap-6 lg:grid-cols-3">

        {/* Job recommendations */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Your job matches</h2>
              <p className="mt-1 text-sm text-muted">
                Ranked according to your skills and profile.
              </p>
            </div>

            <input
              className="input max-w-full sm:max-w-[220px]"
              aria-label="Filter by location"
              placeholder="⌕ Filter by city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {error && (
            <div role="alert" className="panel border border-red-400/30">
              <p className="font-semibold text-gap">Could not load job matches</p>
              <p className="mt-1 text-sm text-muted">{error}</p>
              <button
                onClick={loadRecommendations}
                className="mt-3 text-sm font-semibold text-brand"
              >
                Try again →
              </button>
            </div>
          )}

          {loading ? (
            <div className="panel py-12 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
              <p className="mt-4 font-semibold">Finding your best opportunities...</p>
              <p className="mt-1 text-sm text-muted">
                Comparing your profile with available jobs.
              </p>
            </div>
          ) : !error && recs.length === 0 ? (
            <div className="panel py-10 text-center">
              <div className="text-4xl">🔎</div>
              <h3 className="mt-3 text-lg font-semibold">No matches found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Try another location, add skills to your profile, or upload
                an updated resume.
              </p>
              <Link
                to="/resume"
                className="mt-4 inline-block font-semibold text-brand hover:underline"
              >
                Upload your resume →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recs.map((item) => (
                <JobCard
                  key={item.job.id}
                  job={item.job}
                  rec={item}
                />
              ))}
            </div>
          )}

          <p className="text-xs leading-5 text-muted">
            Match scores are estimates based on skill overlap, text similarity,
            and semantic similarity when enabled. They indicate profile fit,
            not a guarantee of selection or interview.
          </p>
        </section>

        {/* Skill gap panel */}
        <aside className="panel space-y-5 lg:sticky lg:top-24">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-500">
              Career growth
            </span>
            <h2 className="mt-1 text-xl font-bold">Your skill gap</h2>
            <p className="mt-1 text-sm text-muted">
              Discover what employers expect from your target opportunities.
            </p>
          </div>

          {gapLoading ? (
            <p className="py-5 text-sm text-muted">
              Analysing your skill gaps...
            </p>
          ) : gapError ? (
            <div>
              <p className="text-sm text-gap">{gapError}</p>
              <button
                onClick={loadSkillGap}
                className="mt-2 text-sm font-semibold text-brand"
              >
                Try again →
              </button>
            </div>
          ) : !gap || gap.priorities.length === 0 ? (
            <div className="rounded-xl bg-brand-soft p-4">
              <p className="font-semibold">No skill gaps yet</p>
              <p className="mt-1 text-sm text-muted">
                Add skills to your profile and explore job matches to discover
                learning priorities.
              </p>
              <Link
                to="/dashboard"
                className="mt-3 inline-block text-sm font-semibold text-brand"
              >
                Update profile →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brand-soft p-3">
                  <p className="text-xs text-muted">Average match</p>
                  <p className="mt-1 text-xl font-bold text-brand">
                    {gap.average_match_score.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-xl bg-gap-soft p-3">
                  <p className="text-xs text-muted">Jobs analysed</p>
                  <p className="mt-1 text-xl font-bold text-gap">
                    {gap.top_matches_considered}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold">Skills to focus on</h3>
                <p className="mt-1 text-xs text-muted">
                  Higher percentages mean more of your top matches require
                  that skill.
                </p>
              </div>

              <div className="space-y-4">
                {gap.priorities.map((item, index) => (
                  <div key={item.skill}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold">
                          {item.skill}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-gap">
                        {item.share_of_top_matches}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gap-soft">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, item.share_of_top_matches)
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                to="/dashboard"
                className="block rounded-xl border border-line px-4 py-3 text-center text-sm font-semibold transition hover:border-brand hover:text-brand"
              >
                Improve my profile →
              </Link>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
