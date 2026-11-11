
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import { Chips } from "../components/MatchBar.jsx";

const SKILL_GUIDES = {
  pandas: {
    resource: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
    resourceName: "Pandas official tutorials",
    project: "Build a data analysis dashboard using a CSV dataset.",
    steps: [
      "Load and clean CSV data",
      "Filter and group records",
      "Calculate summary statistics",
    ],
  },
  fastapi: {
    resource: "https://fastapi.tiangolo.com/tutorial/",
    resourceName: "FastAPI official tutorial",
    project: "Build a Job Application Tracker REST API.",
    steps: [
      "Create CRUD endpoints",
      "Connect SQLite database",
      "Add request validation",
    ],
  },
  flask: {
    resource: "https://flask.palletsprojects.com/en/stable/quickstart/",
    resourceName: "Flask official documentation",
    project: "Build a simple resume management web application.",
    steps: [
      "Create Flask routes",
      "Build HTML templates",
      "Connect a database",
    ],
  },
  docker: {
    resource: "https://docs.docker.com/get-started/",
    resourceName: "Docker official learning guide",
    project: "Containerize your existing FastAPI application.",
    steps: [
      "Create a Dockerfile",
      "Build a Docker image",
      "Run the application in a container",
    ],
  },
  aws: {
    resource: "https://skillbuilder.aws/",
    resourceName: "AWS Skill Builder",
    project: "Deploy a Python application using AWS services.",
    steps: [
      "Learn AWS fundamentals",
      "Understand cloud deployment",
      "Deploy a small application",
    ],
  },
  "api development": {
    resource: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    resourceName: "MDN HTTP documentation",
    project: "Build a REST API for a student management system.",
    steps: [
      "Understand HTTP methods",
      "Design API endpoints",
      "Test endpoints",
    ],
  },
};

function getSkillPriority(skill, description) {
  const count = description
    .toLowerCase()
    .split(skill.toLowerCase()).length - 1;

  if (count >= 3) return "High";
  if (count >= 2) return "Medium";
  return "Low";
}

const PRIORITY_ORDER = {
  High: 1,
  Medium: 2,
  Low: 3,
};

export default function Resume() {
  const [res, setRes] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [match, setMatch] = useState(null);

  const [err, setErr] = useState("");
  const [matchErr, setMatchErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);

  // Account-based skill completion tracking
  const [completedSkills, setCompletedSkills] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [savingSkill, setSavingSkill] = useState("");
  const [progressErr, setProgressErr] = useState("");

  const input = useRef();

  // Load saved learning progress from the backend
  const loadSkillProgress = async () => {
    setProgressLoading(true);
    setProgressErr("");

    try {
      const response = await api.get("/resume/skill-progress");
      setCompletedSkills(response.data.completed_skills || []);
    } catch (e) {
      setProgressErr(errMsg(e));
    } finally {
      setProgressLoading(false);
    }
  };

  // Load ATS analysis
  const loadAnalysis = async () => {
    try {
      const response = await api.get("/resume/analysis");
      setAnalysis(response.data);
    } catch {
      setAnalysis(null);
    }
  };

  // Load resume and account progress when the page opens
  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await api.get("/resume/latest");
        setRes(response.data);

        if (response.data) {
          await loadAnalysis();
        }
      } catch {
        // No uploaded resume yet.
      }
    };

    loadResume();
    loadSkillProgress();
  }, []);

  // Upload resume
  const upload = async (file) => {
    if (!file) return;

    setBusy(true);
    setErr("");
    setAnalysis(null);
    setMatch(null);
    setMatchErr("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const response = await api.post("/resume/upload", fd);
      setRes(response.data);

      setAnalyzing(true);
      await loadAnalysis();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
      setAnalyzing(false);
    }
  };

  // Delete resume data
  const remove = async () => {
    if (!window.confirm("Are you sure you want to delete your resume data?")) {
      return;
    }

    try {
      await api.delete("/resume");
      setRes(null);
      setAnalysis(null);
      setMatch(null);
      setJobDescription("");
      setErr("");
      setMatchErr("");
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  // Match resume against a job description
  const analyzeJob = async () => {
    if (jobDescription.trim().length < 30) {
      setMatchErr(
        "Please enter a job description with at least 30 characters."
      );
      return;
    }

    setMatching(true);
    setMatchErr("");
    setMatch(null);

    try {
      const response = await api.post("/resume/match", {
        job_description: jobDescription,
      });

      setMatch(response.data);
    } catch (e) {
      setMatchErr(errMsg(e));
    } finally {
      setMatching(false);
    }
  };

  // Save or remove a completed skill in the backend
  const toggleSkillCompletion = async (skill) => {
    const isCurrentlyCompleted = completedSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    setSavingSkill(skill);
    setProgressErr("");

    try {
      await api.put("/resume/skill-progress", {
        skill,
        completed: !isCurrentlyCompleted,
      });

      setCompletedSkills((previous) =>
        isCurrentlyCompleted
          ? previous.filter(
              (item) => item.toLowerCase() !== skill.toLowerCase()
            )
          : [...previous, skill]
      );
    } catch (e) {
      setProgressErr(errMsg(e));
    } finally {
      setSavingSkill("");
    }
  };

  // Resume and ATS values
  const skillCount = res?.skills?.length || 0;
  const atsScore = analysis?.ats_score ?? 0;
  const matchScore = match?.match_percentage ?? 0;

  // Create personalized skill development plan
  const skillPlan = match
    ? match.missing_skills
        .map((skill) => ({
          skill,
          priority: getSkillPriority(skill, jobDescription),
          guide: SKILL_GUIDES[skill.toLowerCase()] || {
            resource: "https://roadmap.sh/",
            resourceName: "Roadmap.sh learning paths",
            project: `Build a beginner-friendly project demonstrating ${skill}.`,
            steps: [
              `Learn the fundamentals of ${skill}`,
              "Practice with small examples",
              `Build a practical project using ${skill}`,
            ],
          },
        }))
        .sort(
          (a, b) =>
            PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        )
    : [];

  // Calculate completion progress for the current plan
  const completedCount = skillPlan.filter(({ skill }) =>
    completedSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    )
  ).length;

  const progressPercentage = skillPlan.length
    ? Math.round((completedCount / skillPlan.length) * 100)
    : 0;

  return (
    <div className="min-h-screen space-y-6 rounded-3xl bg-[#090D1A] p-4 text-slate-100 sm:p-6 lg:p-8">

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#29205B] via-[#171B3B] to-[#101729] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
            AI RESUME INTELLIGENCE
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Make your resume work harder.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Analyze your resume, evaluate its ATS readiness, identify your
            skills and discover how well it matches a job description.
          </p>
        </div>
      </section>

      {/* Upload section */}
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Resume workspace
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Upload your resume
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Supported formats: PDF and TXT · Maximum size: 5 MB
          </p>
        </div>

        <input
          ref={input}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => {
            upload(e.target.files[0]);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-cyan-400/5 px-5 py-12 text-center transition hover:border-violet-300/60 hover:bg-violet-500/15 disabled:cursor-wait disabled:opacity-60"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15 text-3xl text-violet-200 transition group-hover:scale-105">
            ↑
          </span>

          <span className="mt-5 text-lg font-semibold text-white">
            {busy
              ? "Analyzing your resume..."
              : res
              ? "Upload a new resume"
              : "Choose your resume"}
          </span>

          <span className="mt-2 text-sm text-slate-400">
            Click here to browse your device
          </span>

          <span className="mt-4 rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-violet-400">
            {busy ? "Please wait..." : "Select file"}
          </span>
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span>✓ PDF and TXT supported</span>
          <span>✓ Up to 5 MB</span>
          <span>✓ Secure upload</span>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          We store extracted resume text and detected information, not the
          original uploaded file. You can delete your resume data anytime.
        </p>

        {err && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
          >
            {err}
          </p>
        )}
      </section>

      {/* Analysis results */}
      {res && (
        <>
          {/* Resume information */}
          <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Analysis complete
                </p>

                <h2 className="mt-2 break-all text-xl font-bold text-white">
                  {res.filename}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your resume information has been extracted.
                </p>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                ✓ Processed
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-violet-400/15 bg-violet-500/10 p-4">
                <p className="text-xs text-slate-400">Skills detected</p>
                <p className="mt-2 text-3xl font-bold text-violet-300">
                  {skillCount}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                <p className="text-xs text-slate-400">Experience</p>
                <p className="mt-2 text-2xl font-bold text-cyan-300">
                  {res.experience_years
                    ? `${res.experience_years} yrs`
                    : "—"}
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-4 sm:col-span-1">
                <p className="text-xs text-slate-400">Education</p>
                <p className="mt-2 text-lg font-bold text-emerald-300">
                  {res.education?.length || "—"}
                </p>
                <p className="text-xs text-slate-400">Entries detected</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">Skills detected</h3>
                <span className="text-xs text-slate-400">
                  {skillCount} skills
                </span>
              </div>

              {skillCount ? (
                <div className="rounded-xl border border-white/10 bg-[#0B1120] p-4">
                  <Chips items={res.skills} tone="match" />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
                  No known skills detected. You can add your skills manually
                  from your dashboard.
                </p>
              )}
            </div>

            {/* Education */}
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-white">Education</h3>
              <div className="rounded-xl border border-white/10 bg-[#0B1120] p-4">
                <p className="text-sm leading-6 text-slate-300">
                  {res.education?.length
                    ? res.education.join(", ")
                    : "No education details detected."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Review my profile
              </Link>

              <Link
                to="/recommendations"
                className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Explore job matches →
              </Link>
            </div>
          </section>

          {/* ATS Score */}
          <section className="rounded-2xl border border-violet-400/20 bg-[#111827] p-5 sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                Resume evaluation
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                ATS Readiness Score
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                An estimate based on resume structure, content and detected
                skills.
              </p>
            </div>

            {analyzing ? (
              <p className="mt-6 text-sm text-slate-400">
                Calculating your ATS score...
              </p>
            ) : analysis ? (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-[7px] border-emerald-400/30 bg-emerald-400/5">
                    <span className="text-4xl font-bold text-emerald-300">
                      {atsScore}
                    </span>
                    <span className="text-xs text-slate-400">out of 100</span>
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <p className="text-lg font-semibold text-white">
                      {atsScore >= 80
                        ? "Strong resume structure"
                        : atsScore >= 60
                        ? "Good start"
                        : "Needs improvement"}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Your resume contains {analysis.word_count} words and
                      {` ${analysis.sections_found.length}`} recognized
                      sections.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-400">ATS readiness</span>
                    <span className="font-semibold text-emerald-300">
                      {atsScore}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="mb-3 font-semibold text-white">
                    Resume sections detected
                  </h3>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      "Contact information",
                      "Professional summary",
                      "Work experience",
                      "Education",
                      "Skills",
                      "Projects",
                      "Certifications",
                    ].map((section) => {
                      const found = analysis.sections_found.includes(section);

                      return (
                        <div
                          key={section}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1120] p-3"
                        >
                          <span className="text-sm text-slate-300">
                            {section}
                          </span>
                          <span
                            className={
                              found
                                ? "text-sm font-semibold text-emerald-300"
                                : "text-sm font-semibold text-amber-300"
                            }
                          >
                            {found ? "✓ Found" : "Missing"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="mb-3 font-semibold text-white">
                    Improvement suggestions
                  </h3>

                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 p-4"
                      >
                        <span className="text-amber-300">✦</span>
                        <p className="text-sm leading-6 text-slate-300">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm text-slate-400">
                Resume analysis is not available. Try uploading your resume
                again.
              </p>
            )}
          </section>

          {/* Job Description Matching */}
          <section className="rounded-2xl border border-cyan-400/15 bg-[#111827] p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              AI job compatibility
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Match your resume with a job
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Paste a job description to discover which required skills you
              already have and which skills are missing.
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              rows={7}
              maxLength={20000}
              className="mt-5 w-full rounded-xl border border-white/10 bg-[#0B1120] p-4 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Minimum 30 characters</span>
              <span>{jobDescription.length}/20000</span>
            </div>

            <button
              type="button"
              onClick={analyzeJob}
              disabled={matching || jobDescription.trim().length < 30}
              className="mt-4 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {matching ? "Matching your resume..." : "Analyze job match →"}
            </button>

            {matchErr && (
              <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                {matchErr}
              </p>
            )}

            {match && (
              <div className="mt-7 space-y-6">
                {/* Match score */}
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                  <p className="text-sm font-medium text-slate-400">
                    Resume compatibility
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-bold text-cyan-300">
                      {matchScore}%
                    </span>
                    <span className="mb-1 text-sm text-slate-400">
                      skill match
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    {match.matched_skills.length} of{" "}
                    {match.required_skills.length} recognized required skills
                    matched.
                  </p>
                </div>

                {/* Matched and missing skills */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-emerald-300">
                        Matched skills
                      </h3>
                      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                        {match.matched_skills.length}
                      </span>
                    </div>

                    {match.matched_skills.length ? (
                      <Chips items={match.matched_skills} tone="match" />
                    ) : (
                      <p className="text-sm text-slate-400">
                        No matching skills detected.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-amber-300">
                        Missing skills
                      </h3>
                      <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300">
                        {match.missing_skills.length}
                      </span>
                    </div>

                    {match.missing_skills.length ? (
                      <Chips items={match.missing_skills} tone="gap" />
                    ) : (
                      <p className="text-sm text-slate-400">
                        No missing recognized skills detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Personalized Skill Development Plan */}
                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                      Personalized career growth
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-white">
                      Your Skill Development Plan
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Learn the skills missing from this job description
                      using free learning resources and practical projects.
                    </p>
                  </div>

                  {/* Learning progress */}
                  <div className="mt-5 rounded-xl border border-white/10 bg-[#0B1120] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-300">
                        Learning progress
                      </span>

                      <span className="text-sm font-bold text-emerald-300">
                        {progressLoading
                          ? "Loading..."
                          : `${completedCount}/${skillPlan.length} completed`}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {progressPercentage}% of your identified skill gaps
                      completed
                    </p>

                    {progressErr && (
                      <p
                        role="alert"
                        className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
                      >
                        Could not load or update learning progress: {progressErr}
                      </p>
                    )}
                  </div>

                  {/* Priority labels */}
                  <div className="mt-5 flex flex-wrap gap-3 text-xs">
                    <span className="rounded-lg bg-red-400/10 px-3 py-2 text-red-300">
                      High priority
                    </span>
                    <span className="rounded-lg bg-amber-400/10 px-3 py-2 text-amber-300">
                      Medium priority
                    </span>
                    <span className="rounded-lg bg-slate-400/10 px-3 py-2 text-slate-300">
                      Low priority
                    </span>
                  </div>

                  {skillPlan.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {skillPlan.map(({ skill, priority, guide }, index) => {
                        const isCompleted = completedSkills.some(
                          (item) =>
                            item.toLowerCase() === skill.toLowerCase()
                        );

                        const isSaving = savingSkill === skill;

                        return (
                          <div
                            key={skill}
                            className={`rounded-xl border p-4 transition ${
                              isCompleted
                                ? "border-emerald-400/30 bg-emerald-400/5"
                                : "border-white/10 bg-[#0B1120]"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 font-bold text-violet-300">
                                  {index + 1}
                                </span>

                                <h4
                                  className={`font-semibold ${
                                    isCompleted
                                      ? "text-emerald-300"
                                      : "text-white"
                                  }`}
                                >
                                  {skill}
                                </h4>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  priority === "High"
                                    ? "bg-red-400/10 text-red-300"
                                    : priority === "Medium"
                                    ? "bg-amber-400/10 text-amber-300"
                                    : "bg-slate-400/10 text-slate-300"
                                }`}
                              >
                                {priority} priority
                              </span>
                            </div>

                            {/* Completion button */}
                            <button
                              type="button"
                              onClick={() => toggleSkillCompletion(skill)}
                              disabled={isSaving || progressLoading}
                              aria-pressed={isCompleted}
                              className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                                isCompleted
                                  ? "bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25"
                                  : "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
                              }`}
                            >
                              {isSaving
                                ? "Saving..."
                                : isCompleted
                                ? "✓ Marked as learned"
                                : "Mark as learned"}
                            </button>

                            {/* Learning resource */}
                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                                Learning resource
                              </p>

                              <a
                                href={guide.resource}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-block text-sm font-medium text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 hover:text-cyan-200"
                              >
                                {guide.resourceName} ↗
                              </a>
                            </div>

                            {/* Practice project */}
                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                                Practice project
                              </p>

                              <p className="mt-1 text-sm text-slate-300">
                                {guide.project}
                              </p>
                            </div>

                            {/* Learning steps */}
                            <div className="mt-4">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Suggested learning steps
                              </p>

                              <ul className="space-y-2">
                                {guide.steps.map((step, stepIndex) => (
                                  <li
                                    key={stepIndex}
                                    className="flex gap-2 text-sm text-slate-400"
                                  >
                                    <span className="text-emerald-300">✓</span>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-300">
                      Excellent! No missing recognized skills. Keep building
                      projects to demonstrate your expertise.
                    </p>
                  )}
                </div>

                {/* Job match suggestions */}
                <div>
                  <h3 className="mb-3 font-semibold text-white">
                    Job match suggestions
                  </h3>

                  {match.suggestions.map((suggestion, index) => (
                    <p
                      key={index}
                      className="rounded-xl border border-violet-400/15 bg-violet-400/5 p-4 text-sm leading-6 text-slate-300"
                    >
                      ✦ {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Footer actions */}
          <section className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Go to Dashboard
            </Link>

            <Link
              to="/recommendations"
              className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Explore job matches →
            </Link>

            <button
              type="button"
              onClick={remove}
              className="rounded-xl border border-red-400/20 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
            >
              Delete resume data
            </button>
          </section>
        </>
      )}

      {!res && !busy && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827] p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Your resume workspace is ready
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Upload your resume to unlock ATS analysis and job matching.
          </p>
        </div>
      )}
    </div>
  );
}
