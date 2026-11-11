import re

from .skill_extractor import extract_skills

DEGREE_PATTERNS = [
    (r"\b(ph\.?d|doctorate)\b", "PhD"),
    (r"\b(m\.?tech|m\.?e\b|master of technology)", "M.Tech"),
    (r"\b(m\.?sc|master of science)\b", "M.Sc"),
    (r"\b(mca|master of computer applications)\b", "MCA"),
    (r"\b(mba)\b", "MBA"),
    (r"\b(b\.?tech|b\.?e\b|bachelor of technology|bachelor of engineering)", "B.Tech"),
    (r"\b(b\.?sc|bachelor of science)\b", "B.Sc"),
    (r"\b(bca|bachelor of computer applications)\b", "BCA"),
]


def pdf_to_text(data: bytes) -> str:
    import fitz  # PyMuPDF

    with fitz.open(stream=data, filetype="pdf") as doc:
        return "\n".join(page.get_text() for page in doc)


def extract_education(text: str) -> list[str]:
    low = text.lower()
    return [label for pat, label in DEGREE_PATTERNS if re.search(pat, low)]


def extract_experience_years(text: str) -> float:
    """Best-effort: the largest 'N years' mention that is not about a degree duration."""
    years = []
    for m in re.finditer(r"(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)", text.lower()):
        start = max(0, m.start() - 30)
        if "degree" in text.lower()[start:m.start()]:
            continue
        val = float(m.group(1))
        if val <= 40:
            years.append(val)
    return max(years) if years else 0.0


def parse_resume(text: str) -> dict:
    return {
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience_years": extract_experience_years(text),
    }
