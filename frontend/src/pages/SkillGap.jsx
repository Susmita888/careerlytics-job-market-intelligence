
import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="panel">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </div>
  );
}

function SkillBadge({ children }) {
  return (
    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
      ✓ {children}
    </span>
  );
}

function SkillPriority({ item, index, denominatorLabel }) {
  const percentage = Math.min(
    100,
    Math.max(0, item.share_of_role_jobs ?? item.share_of_top_matches ?? 0)
  );

  return (
    <div className="rounded-xl border border-violet-300/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-500">
            {index + 1}
          </span>
          <h3 className="font-semibold">{item.skill}</h3>
        </div>

        <span className="text-sm font-semibold text-violet-500">
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-violet-500/10">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted">
        <span>Required by {item.jobs_requiring} jobs</span>
        <span>{denominatorLabel}</span>
      </div>
    </div>
  );
}

function formatSkill(skill) {
  return skill
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SkillGap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Role comparison state
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesErr, setRolesErr] = useState("");
  const [comparison, setComparison] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareErr, setCompareErr] = useState("");

  useEffect(() => {
    api
      .get("/skills/gap", { params: { top_n: 20 } })
      .then((res) => setData(res.data))
      .catch((e) => setErr(errMsg(e)))
      .finally(() => setLoading(false));

    api
      .get("/skills/roles")
      .then((res) => setRoles(res.data || []))
      .catch((e) => setRolesErr(errMsg(e)))
      .finally(() => setRolesLoading(false));
  }, []);

  function handleRoleChange(role) {
    setComparison(null);
    setCompareErr("");

    setSelectedRoles((previous) => {
      if (previous.includes(role)) {
        return previous.filter((item) => item !== role);
      }

      if (previous.length >= 5) {
        return previous;
      }

      return [...previous, role];
    });
  }

  async function compareRoles() {
    if (selectedRoles.length < 2) {
      setCompareErr("Please select at least two roles.");
      return;
    }

    setCompareLoading(true);
    setCompareErr("");
    setComparison(null);

    try {
      const res = await api.post("/skills/gap/compare", {
        roles: selectedRoles,
      });

      setComparison(res.data);
    } catch (e) {
      setCompareErr(errMsg(e));
    } finally {
      setCompareLoading(false);
    }
  }

  if (loading) {
    return <p className="text-muted">Analyzing your skill gaps...</p>;
  }

  if (err) {
    return (
      <p role="alert" className="rounded bg-gap-soft p-3 text-gap">
        {err}
      </p>
    );
  }

  if (!data) return null;

  const priorities = data.priorities || [];
  const userSkills = data.user_skills || [];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-violet-500">
          CAREER DEVELOPMENT
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Skill Gap Analysis
        </h1>

        <p className="mt-2 text-sm text-muted">
          Discover which skills you already have and which skills can
          improve your chances of matching job opportunities.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Your current skills"
          value={userSkills.length}
          subtitle="Skills in your profile"
        />

        <StatCard
          title="Jobs analyzed"
          value={data.top_matches_considered}
          subtitle="Your recommended job matches"
        />

        <StatCard
          title="Average match score"
          value={`${data.average_match_score}%`}
          subtitle="Across analyzed recommendations"
        />
      </div>

      {/* Existing skills */}
      <section className="panel">
        <h2 className="text-xl font-semibold">
          Your Existing Skills
        </h2>

        <p className="mt-1 text-sm text-muted">
          These are the skills currently available in your profile.
        </p>

        {userSkills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {userSkills.map((skill, index) => (
              <SkillBadge key={`${skill}-${index}`}>
                {skill}
              </SkillBadge>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No skills found. Add skills to your profile to get a
            personalized analysis.
          </p>
        )}
      </section>

      {/* General missing skills */}
      <section className="panel">
        <div>
          <h2 className="text-xl font-semibold">
            Recommended Skills to Learn
          </h2>

          <p className="mt-1 text-sm text-muted">
            Skills ranked according to how frequently they appear in
            your recommended job matches.
          </p>
        </div>

        {priorities.length > 0 ? (
          <div className="mt-5 space-y-5">
            {priorities.map((item, index) => (
              <SkillPriority
                key={item.skill}
                item={item}
                index={index}
                denominatorLabel={item.reason}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-emerald-500/10 p-5">
            <h3 className="font-semibold text-emerald-600">
              Great job!
            </h3>
            <p className="mt-1 text-sm text-muted">
              No missing skills were identified in your current
              recommended job matches.
            </p>
          </div>
        )}
      </section>

      {/* Multi-role comparison */}
      <section className="panel">
        <div>
          <p className="text-sm font-medium text-violet-500">
            CAREER EXPLORATION
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Compare Job Roles
          </h2>

          <p className="mt-1 text-sm text-muted">
            Select 2–5 roles to discover the skills required by each
            role and identify skills that are common across them.
          </p>
        </div>

        {rolesLoading ? (
          <p className="mt-4 text-sm text-muted">
            Loading available job roles...
          </p>
        ) : rolesErr ? (
          <p role="alert" className="mt-4 text-sm text-gap">
            {rolesErr}
          </p>
        ) : roles.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No job roles are currently available.
          </p>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Available Job Roles</h3>

              <span className="text-xs text-muted">
                {selectedRoles.length}/5 selected
              </span>
            </div>

            <p className="mt-1 text-xs text-muted">
              Choose at least 2 roles. You can select up to 5.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const checked = selectedRoles.includes(role.value);
                const disabled =
                  !checked && selectedRoles.length >= 5;

                return (
                  <label
                    key={role.value}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${
                      checked
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-violet-300/20 hover:border-violet-400/60"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => handleRoleChange(role.value)}
                        className="h-4 w-4 accent-violet-500"
                      />

                      <span className="text-sm font-medium">
                        {role.label}
                      </span>
                    </div>

                    <span className="text-xs text-muted">
                      {role.job_count} jobs
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={compareRoles}
              disabled={selectedRoles.length < 2 || compareLoading}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {compareLoading ? "Comparing roles..." : "Compare Selected Roles"}
            </button>

            {compareErr && (
              <p role="alert" className="mt-3 text-sm text-gap">
                {compareErr}
              </p>
            )}
          </>
        )}
      </section>

      {/* Comparison results */}
      {comparison && (
        <>
          {/* Common missing skills */}
          <section className="panel">
            <h2 className="text-xl font-semibold">
              Common Missing Skills
            </h2>

            <p className="mt-1 text-sm text-muted">
              These skills are missing from your profile and appear
              in every selected role.
            </p>

            {comparison.common_missing_skills?.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {comparison.common_missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-600"
                  >
                    {formatSkill(skill)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-600">
                No common missing skills were found across all selected
                roles.
              </p>
            )}
          </section>

          {/* Individual role results */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Role-wise Skill Gap
              </h2>

              <p className="mt-1 text-sm text-muted">
                Explore the skills you already have and the skills
                you should learn for each selected role.
              </p>
            </div>

            {comparison.roles.map((role) => (
              <div key={role.role} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">
                      {formatSkill(role.role)}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      {role.total_jobs} total jobs analyzed
                    </p>
                  </div>

                  <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-500">
                    {role.jobs_with_skills} jobs with skill data
                  </span>
                </div>

                {/* Skills already owned */}
                <div className="mt-5">
                  <h4 className="font-semibold">
                    Skills You Already Have
                  </h4>

                  {role.existing_skills?.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {role.existing_skills.map((skill) => (
                        <SkillBadge key={skill}>
                          {skill}
                        </SkillBadge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      No matching existing skills found for this role.
                    </p>
                  )}
                </div>

                {/* Missing skills */}
                <div className="mt-6">
                  <h4 className="font-semibold">
                    Skills You Need to Learn
                  </h4>

                  {role.missing_skills?.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {role.missing_skills.slice(0, 10).map((item, index) => (
                        <SkillPriority
                          key={item.skill}
                          item={item}
                          index={index}
                          denominatorLabel="Of jobs with skill data"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-600">
                      No missing skills identified for this role.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Guidance */}
      <section className="panel">
        <h2 className="text-xl font-semibold">
          Your Next Steps
        </h2>

        <p className="mt-2 text-sm text-muted">
          Start with the highest-ranked skill in your list. Learning
          skills that appear frequently in your recommended jobs can
          help improve your job compatibility.
        </p>

        {priorities.length > 0 && (
          <div className="mt-4 rounded-xl border border-violet-300/20 p-4">
            <p className="text-xs text-muted">
              Suggested first priority
            </p>

            <h3 className="mt-1 text-lg font-bold text-violet-500">
              {priorities[0].skill}
            </h3>

            <p className="mt-1 text-sm text-muted">
              This skill is required by {priorities[0].jobs_requiring}{" "}
              of your analyzed job matches.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
