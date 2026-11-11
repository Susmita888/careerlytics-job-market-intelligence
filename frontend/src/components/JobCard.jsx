
import { useState } from "react";
import api, { salary } from "../api";
import { Chips, MatchBar } from "./MatchBar.jsx";
import { useAuth } from "../auth.jsx";

export default function JobCard({ job, rec }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(Boolean(job.saved));

  const toggle = async () => {
    try {
      await (
        saved
          ? api.delete(`/jobs/${job.id}/save`)
          : api.post(`/jobs/${job.id}/save`)
      );
      setSaved(!saved);
    } catch (e) {
      console.error("Could not update saved job:", e);
    }
  };

  return (
    <article className="group rounded-2xl border border-white/10 bg-[#111827] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-xl hover:shadow-violet-950/20 sm:p-6">

      {/* Job heading */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              Job opportunity
            </span>

            {rec && (
              <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300">
                AI Recommended
              </span>
            )}
          </div>

          <h3 className="break-words text-lg font-bold leading-snug text-white transition group-hover:text-violet-200">
            {job.title}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-300">
            {job.company || "Company not listed"}
          </p>
        </div>

        {user && (
          <button
            type="button"
            className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              saved
                ? "border-violet-400/30 bg-violet-500/15 text-violet-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200"
            }`}
            aria-pressed={saved}
            onClick={toggle}
          >
            {saved ? "★ Saved" : "☆ Save"}
          </button>
        )}
      </div>

      {/* Job details */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-slate-300">
          📍 {job.location || "Location not specified"}
        </span>

        <span className="rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-slate-300">
          ◷ {job.experience_level || "Experience not specified"}
        </span>
      </div>

      {/* Salary */}
      <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
          Salary information
        </p>
        <p className="mt-1 text-sm font-bold text-white">
          {salary(job)}
        </p>
      </div>

      {/* AI recommendation details */}
      {rec ? (
        <div className="mt-5 space-y-4">
          <div className="h-px bg-white/10" />

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              Your skill compatibility
            </h4>

            <MatchBar
              matched={rec.matched_skills}
              missing={rec.missing_skills}
              score={rec.score}
            />
          </div>

          {rec.explanation && (
            <p className="rounded-xl border border-white/10 bg-[#0B1120] p-3 text-xs leading-5 text-slate-400">
              <span className="font-semibold text-violet-300">
                Why this job?
              </span>{" "}
              {rec.explanation}
            </p>
          )}

          {rec.matched_skills?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-emerald-300">
                ✓ Skills you have
              </p>
              <Chips items={rec.matched_skills} tone="match" />
            </div>
          )}

          {rec.missing_skills?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-amber-300">
                + Skills to improve
              </p>
              <Chips items={rec.missing_skills} tone="gap" />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-3 h-px bg-white/10" />
          <p className="mb-2 text-xs font-semibold text-slate-400">
            Required skills
          </p>

          {job.skills?.length > 0 ? (
            <Chips items={job.skills.slice(0, 8)} />
          ) : (
            <p className="text-xs text-slate-500">
              Skills not listed.
            </p>
          )}
        </div>
      )}

      {/* Original listing */}
      {job.url && (
        <a
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 hover:text-violet-200"
          href={job.url}
          target="_blank"
          rel="noreferrer"
        >
          View original listing
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}
