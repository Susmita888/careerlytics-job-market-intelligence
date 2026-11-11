
import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

const STORAGE_KEY = "careerlytics_roadmap_progress";

const learningTasks = [
  {
    title: "Learn the fundamentals",
    description: (skill) =>
      `Understand the core concepts, terminology, and fundamentals of ${skill}.`,
  },
  {
    title: "Practice with exercises",
    description: (skill) =>
      `Solve practical ${skill} exercises and work through real-world examples.`,
  },
  {
    title: "Build a mini project",
    description: (skill) =>
      `Build a small project using ${skill} and add it to your portfolio.`,
  },
];

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function formatSkill(skill) {
  return skill
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTaskId(role, skill, index) {
  return role
    ? `${role}::${skill}-${index}`
    : `${skill}-${index}`;
}

export default function Roadmap() {
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(loadProgress);

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [comparison, setComparison] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [compareLoading, setCompareLoading] = useState(false);

  const [err, setErr] = useState("");
  const [rolesErr, setRolesErr] = useState("");
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

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

  async function generateRoleRoadmap() {
    if (selectedRoles.length < 2) {
      setCompareErr("Please select at least two job roles.");
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

  const toggleTask = (id) => {
    setProgress((previous) => ({
      ...previous,
      [id]: !(previous[id] ?? false),
    }));
  };

  // When a role comparison exists, use its role-specific missing skills.
  // Otherwise, retain the original general roadmap.
  const roleMode = Boolean(comparison);

  const roadmapItems = roleMode
    ? comparison.roles.flatMap((role) =>
        (role.missing_skills || []).slice(0, 10).map((item) => ({
          ...item,
          role: role.role,
        }))
      )
    : (data?.priorities || []).map((item) => ({
        ...item,
        role: "",
      }));

  // Read old progress keys as a fallback so existing progress is preserved.
  function isTaskCompleted(item, taskIndex) {
    const newId = getTaskId(item.role, item.skill, taskIndex);
    const oldId = `${item.skill}-${taskIndex}`;

    if (item.role && progress[newId] === undefined) {
      return Boolean(progress[oldId]);
    }

    return Boolean(progress[newId]);
  }

  const totalTasks = roadmapItems.length * learningTasks.length;

  const completedTasks = roadmapItems.reduce((total, item) => {
    return (
      total +
      learningTasks.filter((_, index) =>
        isTaskCompleted(item, index)
      ).length
    );
  }, 0);

  const completion = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  if (loading) {
    return (
      <p className="text-muted">
        Preparing your learning roadmap...
      </p>
    );
  }

  if (err) {
    return (
      <p role="alert" className="rounded bg-gap-soft p-3 text-gap">
        {err}
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-sm font-medium text-violet-500">
          CAREER DEVELOPMENT
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Personalized Learning Roadmap
        </h1>

        <p className="mt-2 text-sm text-muted">
          Follow a structured learning path based on the skills
          missing from your recommended jobs and selected career roles.
        </p>
      </div>

      {/* Role selector */}
      <section className="panel">
        <p className="text-sm font-medium text-violet-500">
          PERSONALIZED CAREER PATH
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Choose Your Target Roles
        </h2>

        <p className="mt-1 text-sm text-muted">
          Select 2–5 roles to generate separate learning roadmaps
          based on real job requirements.
        </p>

        {rolesLoading ? (
          <p className="mt-4 text-sm text-muted">
            Loading job roles...
          </p>
        ) : rolesErr ? (
          <p role="alert" className="mt-4 text-sm text-gap">
            {rolesErr}
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-semibold">Available Roles</h3>
              <span className="text-xs text-muted">
                {selectedRoles.length}/5 selected
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const checked = selectedRoles.includes(role.value);
                const disabled =
                  !checked && selectedRoles.length >= 5;

                return (
                  <label
                    key={role.value}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${
                      checked
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-violet-300/20 hover:border-violet-400/60"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => handleRoleChange(role.value)}
                        className="h-4 w-4 accent-violet-600"
                      />

                      <span className="text-sm font-medium">
                        {role.label}
                      </span>
                    </span>

                    <span className="text-xs text-muted">
                      {role.job_count} jobs
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={generateRoleRoadmap}
              disabled={selectedRoles.length < 2 || compareLoading}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {compareLoading
                ? "Generating roadmap..."
                : "Generate Role-Specific Roadmap"}
            </button>

            {compareErr && (
              <p role="alert" className="mt-3 text-sm text-gap">
                {compareErr}
              </p>
            )}
          </>
        )}
      </section>

      {/* Progress overview */}
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Your Learning Progress
            </h2>

            <p className="mt-1 text-sm text-muted">
              {completedTasks} of {totalTasks} learning activities completed
            </p>
          </div>

          <span className="text-2xl font-bold text-violet-500">
            {completion}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-violet-500/10">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>

        {roleMode && (
          <p className="mt-3 text-xs text-muted">
            Progress is tracked separately for each selected role.
          </p>
        )}
      </section>

      {/* Common skills */}
      {roleMode && (
        <section className="panel">
          <h2 className="text-xl font-semibold">
            Common Skills to Learn
          </h2>

          <p className="mt-1 text-sm text-muted">
            These skills are missing across every selected role.
          </p>

          {comparison.common_missing_skills?.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {comparison.common_missing_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600"
                >
                  {formatSkill(skill)}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No common missing skills found.
            </p>
          )}
        </section>
      )}

      {/* Roadmap */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {roleMode
              ? "Your Role-Specific Learning Plans"
              : "Your Learning Journey"}
          </h2>

          <p className="mt-1 text-sm text-muted">
            Complete the activities in order to strengthen your skills.
          </p>
        </div>

        {roadmapItems.length > 0 ? (
          roleMode ? (
            <div className="space-y-6">
              {comparison.roles.map((role) => {
                const roleItems = roadmapItems.filter(
                  (item) => item.role === role.role
                );

                const roleTotal = roleItems.length * learningTasks.length;

                const roleCompleted = roleItems.reduce(
                  (total, item) =>
                    total +
                    learningTasks.filter((_, index) =>
                      isTaskCompleted(item, index)
                    ).length,
                  0
                );

                return (
                  <div key={role.role} className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-violet-500">
                        {formatSkill(role.role)}
                      </h3>

                      <span className="text-xs text-muted">
                        {roleCompleted}/{roleTotal} activities completed
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-violet-500/10">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{
                          width: `${
                            roleTotal
                              ? (roleCompleted / roleTotal) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    {roleItems.map((item, index) => (
                      <SkillCard
                        key={`${role.role}-${item.skill}`}
                        item={item}
                        index={index}
                        progress={progress}
                        isTaskCompleted={isTaskCompleted}
                        toggleTask={toggleTask}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {roadmapItems.map((item, index) => (
                <SkillCard
                  key={item.skill}
                  item={item}
                  index={index}
                  progress={progress}
                  isTaskCompleted={isTaskCompleted}
                  toggleTask={toggleTask}
                />
              ))}
            </div>
          )
        ) : (
          <div className="panel">
            <h3 className="font-semibold">
              No learning priorities available yet
            </h3>

            <p className="mt-2 text-sm text-muted">
              Update your profile with skills and generate job
              recommendations to create your personalized roadmap.
            </p>
          </div>
        )}
      </section>

      {/* Completion message */}
      {completion === 100 && totalTasks > 0 && (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <h2 className="font-semibold text-emerald-600">
            Congratulations! You completed your roadmap.
          </h2>

          <p className="mt-1 text-sm text-muted">
            You have marked all your learning activities as completed.
            Continue building projects to strengthen your portfolio.
          </p>
        </section>
      )}
    </div>
  );
}

function SkillCard({
  item,
  index,
  isTaskCompleted,
  toggleTask,
}) {
  const completed = learningTasks.filter((_, taskIndex) =>
    isTaskCompleted(item, taskIndex)
  ).length;

  return (
    <div className="panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 font-bold text-violet-500">
            {index + 1}
          </span>

          <div>
            <h3 className="text-lg font-semibold">
              {item.skill}
            </h3>

            <p className="text-xs text-muted">
              Required by {item.jobs_requiring} jobs
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold text-violet-500">
          {completed}/3 completed
        </span>
      </div>

      {item.share_of_role_jobs !== undefined && (
        <p className="mt-2 text-xs text-muted">
          Appears in {item.share_of_role_jobs}% of jobs with skill data
        </p>
      )}

      <div className="mt-4 space-y-3">
        {learningTasks.map((task, taskIndex) => {
          const id = getTaskId(item.role, item.skill, taskIndex);
          const checked = isTaskCompleted(item, taskIndex);

          return (
            <label
              key={id}
              className="flex cursor-pointer gap-3 rounded-xl border border-violet-300/20 p-3 transition hover:bg-violet-500/5"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleTask(id)}
                className="mt-1 h-4 w-4 accent-violet-600"
              />

              <div>
                <p
                  className={`text-sm font-semibold ${
                    checked ? "text-muted line-through" : ""
                  }`}
                >
                  {taskIndex + 1}. {task.title}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {task.description(item.skill)}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
