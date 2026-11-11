
import re

from .skill_extractor import extract_skills


SECTION_PATTERNS = {
    "Contact information": r"\b(email|phone|mobile|linkedin|github)\b",
    "Professional summary": r"\b(summary|objective|profile)\b",
    "Work experience": r"\b(experience|employment|work history|internship)\b",
    "Education": r"\b(education|academic|qualification)\b",
    "Skills": r"\b(skills|technical skills|core competencies)\b",
    "Projects": r"\b(projects|personal projects|academic projects)\b",
    "Certifications": r"\b(certifications|certificates|courses)\b",
}


def analyze_resume(text: str) -> dict:
    """Return a rule-based ATS estimate and improvement suggestions."""

    text = text or ""
    clean_text = re.sub(r"\s+", " ", text).strip()
    lower_text = clean_text.lower()
    words = re.findall(r"\b[\w+#.]+\b", clean_text)

    sections_found = [
        section
        for section, pattern in SECTION_PATTERNS.items()
        if re.search(pattern, lower_text)
    ]

    score = 0
    suggestions = []

    # Resume length: 10 points
    if 250 <= len(words) <= 1000:
        score += 10
    elif 150 <= len(words) < 250 or 1000 < len(words) <= 1300:
        score += 7
        suggestions.append(
            "Review your resume length. Aim for concise, relevant content."
        )
    else:
        score += 3
        suggestions.append(
            "Add more relevant details or remove unnecessary content to improve resume length."
        )

    # Section coverage: 35 points
    score += min(len(sections_found) * 5, 35)

    for section in SECTION_PATTERNS:
        if section not in sections_found:
            suggestions.append(f"Consider adding a {section} section.")

    # Contact information: 10 points
    if re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", clean_text):
        score += 5
    else:
        suggestions.append("Add a professional email address.")

    if re.search(r"(\+?\d[\d\s().-]{8,}\d)", clean_text):
        score += 5
    else:
        suggestions.append("Add a reachable phone number.")

    # Quantified achievements: 15 points
    numbers = re.findall(r"\b\d+(?:\.\d+)?%?\b", clean_text)
    if len(numbers) >= 3:
        score += 15
    elif len(numbers) >= 1:
        score += 8
        suggestions.append(
            "Include more measurable achievements, such as percentages, time saved, or project results."
        )
    else:
        suggestions.append(
            "Add measurable achievements wherever possible instead of listing responsibilities alone."
        )

    # Action verbs: 10 points
    action_verbs = {
        "developed", "created", "built", "designed", "implemented",
        "managed", "analyzed", "improved", "led", "automated",
        "deployed", "optimized", "tested", "maintained"
    }
    found_verbs = [
        verb for verb in action_verbs
        if re.search(r"\b" + re.escape(verb) + r"\b", lower_text)
    ]

    if len(found_verbs) >= 3:
        score += 10
    elif found_verbs:
        score += 5
        suggestions.append(
            "Use more strong action verbs to describe your work and projects."
        )
    else:
        suggestions.append(
            "Start experience and project bullet points with action verbs such as Developed, Built, or Implemented."
        )

    # Skills: 20 points
    detected_skills = extract_skills(text)
    if len(detected_skills) >= 8:
        score += 20
    elif len(detected_skills) >= 4:
        score += 12
        suggestions.append(
            "Add relevant technical and professional skills that you can demonstrate."
        )
    elif detected_skills:
        score += 6
        suggestions.append(
            "Include more relevant skills that match your target job."
        )
    else:
        suggestions.append("Add a clearly labelled skills section.")

    score = min(score, 100)

    if not suggestions:
        suggestions.append(
            "Your resume covers the main checks. Keep tailoring it to each job description."
        )

    return {
        "ats_score": score,
        "word_count": len(words),
        "sections_found": sections_found,
        "skills": detected_skills,
        "suggestions": suggestions,
    }


def _skill_match_key(skill: str) -> str:
    """Normalize closely related skill names for matching."""

    skill = re.sub(r"\s+", " ", skill.strip().lower())

    equivalence_groups = {
        "api development": {
            "api development",
            "rest api",
            "rest apis",
        }
    }

    for canonical, aliases in equivalence_groups.items():
        if skill in aliases:
            return canonical

    return skill


def match_resume_to_job(resume_text: str, job_description: str) -> dict:
    """Compare resume skills with job requirements using normalized matching."""

    resume_skills = extract_skills(resume_text or "")
    required_skills = extract_skills(job_description or "")

    # Normalize resume skills.
    resume_keys = {
        _skill_match_key(skill)
        for skill in resume_skills
    }

    # Deduplicate equivalent requirements in the job description.
    required_by_key = {}

    for skill in required_skills:
        key = _skill_match_key(skill)

        if key not in required_by_key:
            required_by_key[key] = skill

    matched = []
    missing = []

    for key, display_name in required_by_key.items():
        if key in resume_keys:
            matched.append(display_name)
        else:
            missing.append(display_name)

    required = list(required_by_key.values())

    total = len(required)
    match_percentage = (
        round((len(matched) / total) * 100, 1)
        if total else 0
    )

    suggestions = []

    if not total:
        suggestions.append(
            "No recognized skills were detected in the job description. "
            "Try including its technical requirements."
        )

    elif missing:
        suggestions.append(
            "Consider learning or demonstrating these missing skills: "
            + ", ".join(missing) + "."
        )

    else:
        suggestions.append(
            "All detected job-description skills are present in your resume. "
            "Check that your experience demonstrates them."
        )

    return {
        "match_percentage": match_percentage,
        "matched_skills": matched,
        "missing_skills": missing,
        "required_skills": required,
        "suggestions": suggestions,
    }