
// Displays overall match score and separate skill coverage.
export function MatchBar({
  matched = [],
  missing = [],
  score,
}) {
  const matchedSkills = Array.isArray(matched) ? matched : [];
  const missingSkills = Array.isArray(missing) ? missing : [];

  const total = matchedSkills.length + missingSkills.length;

  // Skill coverage is separate from the overall AI match score.
  const skillCoverage = total
    ? (matchedSkills.length / total) * 100
    : 0;

  // Supports scores represented as either 0–1 or 0–100.
  const numericScore = Number(score);
  const validScore =
    score !== null &&
    score !== undefined &&
    Number.isFinite(numericScore);

  const displayScore = validScore
    ? Math.round(
        Math.min(100, Math.max(0, numericScore <= 1 ? numericScore * 100 : numericScore))
      )
    : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-ink">
          {displayScore !== null
            ? `${displayScore}% AI match`
            : `${matchedSkills.length} of ${total} skills`}
        </span>

        <span className="text-muted">
          {matchedSkills.length} of {total} skills
        </span>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-gap-soft"
        role="progressbar"
        aria-valuenow={Math.round(skillCoverage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Required skill coverage"
      >
        <div
          className="h-full rounded-full bg-match transition-all duration-500"
          style={{ width: `${skillCoverage}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-muted">
        Skill coverage: {Math.round(skillCoverage)}%
      </p>
    </div>
  );
}

// Reusable skill chips.
export function Chips({ items = [], tone = "brand" }) {
  const tones = {
    brand: "bg-brand-soft text-brand-dark",
    match: "bg-match-soft text-match",
    gap: "bg-gap-soft text-gap",
  };

  const chipClass = tones[tone] || tones.brand;
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <ul className="flex flex-wrap gap-1.5">
      {safeItems.map((skill, index) => (
        <li
          key={`${skill}-${index}`}
          className={`rounded px-2 py-0.5 text-xs font-medium ${chipClass}`}
        >
          {skill}
        </li>
      ))}
    </ul>
  );
}
