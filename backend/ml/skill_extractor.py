"""Dictionary + regex skill extraction with word-boundary matching and aliases.

Why not plain substring matching? "sql" would match inside "PostgreSQL"/"MySQL", "go" inside
"good", and "r" inside everything. We use boundary-aware regexes instead.
"""
import re
from functools import lru_cache

from .skills_dictionary import SKILLS

# Characters that may legitimately be part of a skill token (C++, C#, Node.js, CI/CD)
_BEFORE = r"(?<![A-Za-z0-9+#])"
_AFTER = r"(?![A-Za-z0-9+#])"
# Skills whose bare name is too ambiguous in lower case; they match only in their exact casing.
_CASE_SENSITIVE = {"Go", "R", "dbt"}
# For these, only aliases are searched (not the bare name)
_ALIAS_ONLY = {"R", "Go"}


def _phrase(term: str) -> str:
    return r"\s+".join(re.escape(part) for part in term.split())


@lru_cache(maxsize=1)
def _patterns() -> list[tuple[str, re.Pattern]]:
    out = []
    for name, (_, aliases) in SKILLS.items():
        terms = list(aliases) if name in _ALIAS_ONLY else [name, *aliases]
        if not terms:
            continue
        body = "|".join(sorted((_phrase(t) for t in terms), key=len, reverse=True))
        flags = 0 if name in _CASE_SENSITIVE else re.IGNORECASE
        out.append((name, re.compile(f"{_BEFORE}(?:{body}){_AFTER}", flags)))
    return out



def extract_skills(text: str) -> list[str]:
    """Return canonical skill names found in text, in dictionary order."""
    if not text:
        return []

    found = []

    # Remove Embedded C before searching for standalone C.
    text_without_embedded_c = re.sub(
        r"\bEmbedded\s+C\b",
        "",
        text,
        flags=re.IGNORECASE
    )

    # Require C to appear in a skill-list context.
    c_context = re.compile(
        r"(?:^|[,;|•\n])\s*C\s*(?=$|[,;|•\n])"
    )

    for name, pattern in _patterns():
        if name == "C":
            if c_context.search(text_without_embedded_c):
                found.append(name)
            elif name == "C#":
                if re.search(r"(?<![A-Za-z0-9+])C#(?![A-Za-z0-9+#])", text):
                    found.append(name)
        elif pattern.search(text):
            found.append(name)

    # Standalone R in skill lists.
    if "R" not in found and re.search(
        r"(?:^|[,;|•])\s*R\s*(?=$|[,;|•])",
        text
    ):
        found.append("R")

    return found
