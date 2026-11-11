
import hashlib
import re
from datetime import date, datetime

from bs4 import BeautifulSoup


def clean_html(value):
    if not value:
        return ""

    return BeautifulSoup(
        str(value),
        "html.parser"
    ).get_text(" ", strip=True)


def normalize_title(value):
    if not value:
        return None

    value = str(value).lower().strip()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.title() or None


def normalize_company(value):
    if not value:
        return None

    value = str(value).strip()
    value = re.sub(r"\s+", " ", value)

    return value.title() or None


def normalize_location(value):
    if not value:
        return "Unknown"

    value = str(value).strip()
    value = re.sub(r"\s+", " ", value)

    city_aliases = {
        "bangalore": "Bengaluru",
        "bengaluru": "Bengaluru",
        "bombay": "Mumbai",
        "mumbai": "Mumbai",
        "madras": "Chennai",
        "chennai": "Chennai",
        "calcutta": "Kolkata",
        "kolkata": "Kolkata"
    }

    parts = [part.strip() for part in value.split(",")]
    city = parts[0].lower()

    if city in city_aliases:
        return city_aliases[city]

    return value.title()


def classify_role(title):
    if not title:
        return "Other"

    title = title.lower().strip()

    # Specific technology roles must be checked first.
    specific_roles = {
        "data engineer": [
            "data engineer",
            "big data engineer"
        ],
        "data scientist": [
            "data scientist"
        ],
        "data analyst": [
            "data analyst"
        ],
        "ml engineer": [
            "machine learning engineer",
            "ml engineer"
        ],
        "backend developer": [
            "backend developer",
            "back-end developer",
            "backend engineer"
        ],
        "frontend developer": [
            "frontend developer",
            "front-end developer",
            "frontend engineer"
        ],
        "full stack developer": [
            "full stack developer",
            "full-stack developer",
            "full stack engineer"
        ],
        "devops engineer": [
            "devops engineer",
            "devops"
        ]
    }

    for role, keywords in specific_roles.items():
        if any(keyword in title for keyword in keywords):
            return role

    # Broad job categories.
    # More specific categories are checked before general categories.
    role_keywords = {
        "Software Development": [
            "software developer",
            "software engineer",
            "java developer",
            "python developer",
            "web developer"
        ],

        "Cybersecurity": [
            "cyber security",
            "cybersecurity",
            "security analyst",
            "security engineer"
        ],

        "Cloud and DevOps": [
            "cloud engineer",
            "aws engineer",
            "azure engineer"
        ],

        "Testing and QA": [
            "quality assurance",
            "qa engineer",
            "automation engineer",
            "tester",
            "testing"
        ],

        "IT Support": [
            "software support",
            "technical support",
            "it support",
            "help desk",
            "desktop support"
        ],

        "Data Science": [
            "machine learning",
            "artificial intelligence",
            "business analyst"
        ],

        "Marketing & Communications": [
            "marketing",
            "content writer",
            "copywriter",
            "communications",
            "public relations",
            "seo"
        ],

        "Human Resources": [
            "recruiter",
            "human resource",
            "hr executive",
            "talent acquisition"
        ],

        "Finance & Accounting": [
            "financial analyst",
            "accountant",
            "accounting",
            "accounts executive",
            "controller",
            "loan coordinator",
            "finance"
        ],

        "Healthcare": [
            "therapist",
            "counselor",
            "physician",
            "respiratory",
            "acupuncturist",
            "clinical",
            "pharmacist",
            "healthcare",
            "medical",
            "nurse",
            "doctor"
        ],

        "Legal": [
            "attorney",
            "lawyer",
            "paralegal",
            "legal"
        ],

        "Engineering": [
            "structural engineer",
            "building engineer",
            "project architect",
            "architect",
            "service technician",
            "construction technician",
            "sheet metal"
        ],

        "Customer Support": [
            "customer service",
            "customer support",
            "reservationist",
            "client service"
        ],

        "Hospitality & Services": [
            "restaurant",
            "event worker",
            "barber",
            "worship leader"
        ],

        "Fitness & Wellness": [
            "swim instructor",
            "fitness coach",
            "wellness coach",
            "loading coach"
        ],

        "Education & Training": [
            "teacher",
            "instructor",
            "trainer",
            "tutor",
            "education"
        ],

        "Media & Entertainment": [
            "producer",
            "media",
            "film",
            "video production"
        ],

        "Manufacturing & Production": [
            "fabricator",
            "production planner",
            "general laborer"
        ],

        "Administration": [
            "administrative assistant",
            "administrative coordinator",
            "administrative",
            "office coordinator",
            "secretary"
        ],

        "Sales and Marketing": [
            "sales",
            "business development"
        ]
    }

    for category, keywords in role_keywords.items():
        if any(keyword in title for keyword in keywords):
            return category

    return "Other"


def infer_experience(value):
    """Preserve experience ranges such as '2-4 Yrs'."""

    if value is None:
        return None

    value = str(value).strip()
    return value if value else None


def to_number(value):
    if value is None:
        return None

    try:
        number = float(value)
        return number if number > 0 else None
    except (TypeError, ValueError):
        return None


def normalize_salary(
    lo,
    hi,
    period="year",
    currency_factor=1.0
):
    """Normalize supported salary periods to annual INR."""

    lo = to_number(lo)
    hi = to_number(hi)

    period = str(period or "year").lower().strip()

    multipliers = {
        "year": 1,
        "yearly": 1,
        "annual": 1,
        "month": 12,
        "monthly": 12,
        "lpa": 100_000
    }

    if period not in multipliers:
        return None, None

    try:
        factor = float(currency_factor)
    except (TypeError, ValueError):
        return None, None

    if factor <= 0:
        return None, None

    multiplier = multipliers[period] * factor

    lo = lo * multiplier if lo is not None else None
    hi = hi * multiplier if hi is not None else None

    if lo is None:
        lo = hi

    if hi is None:
        hi = lo

    if lo is None or hi is None:
        return None, None

    if lo > hi:
        lo, hi = hi, lo

    # Plausibility limits for annual INR salaries.
    if lo < 50_000 or hi > 50_000_000:
        return None, None

    return round(lo, 2), round(hi, 2)


def parse_date(value):
    """Parse actual dates; relative date text remains None."""

    if value is None:
        return None

    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    try:
        return datetime.strptime(
            str(value).strip(),
            "%Y-%m-%d"
        ).date()
    except (ValueError, TypeError):
        return None


def fingerprint(record):
    """Create a fingerprint that distinguishes different vacancies."""

    def normalize(value):
        value = str(value or "").lower().strip()
        return re.sub(r"\s+", " ", value)

    parts = [
        normalize(record.get("source")),
        normalize(record.get("title")),
        normalize(record.get("company")),
        normalize(record.get("location")),
        normalize(record.get("description"))
    ]

    content = "|".join(parts)

    return hashlib.sha256(
        content.encode("utf-8")
    ).hexdigest()


def transform(record):
    """Clean and standardize one job record."""

    title = normalize_title(record.get("title"))

    if not title:
        return None

    description = clean_html(
        record.get("description")
    )

    salary_min, salary_max = normalize_salary(
        record.get("salary_min"),
        record.get("salary_max"),
        period=record.get("salary_period", "year"),
        currency_factor=record.get("currency_factor", 1.0)
    )

    cleaned = {
        "source": record.get("source"),
        "source_id": record.get("source_id"),
        "title": title,
        "role_family": classify_role(title),
        "company": normalize_company(
            record.get("company")
        ),
        "location": normalize_location(
            record.get("location")
        ),
        "job_type": record.get("job_type"),
        "experience_level": infer_experience(
            record.get("experience_level")
        ),
        "salary_min": salary_min,
        "salary_max": salary_max,
        "description": description,
        "posted_date": parse_date(
            record.get("posted_date")
        ),
        "url": record.get("url")
    }

    cleaned["fingerprint"] = fingerprint(cleaned)

    return cleaned


def deduplicate(records):
    """Remove duplicate records while preserving distinct vacancies."""

    seen_ids = set()
    seen_fingerprints = set()
    unique_records = []

    for record in records:
        if not record:
            continue

        source = record.get("source")
        source_id = record.get("source_id")

        # Source ID is the strongest identifier when available.
        if source_id:
            id_key = (source, str(source_id))

            if id_key in seen_ids:
                continue

            seen_ids.add(id_key)

        else:
            record_fingerprint = record.get("fingerprint")

            if record_fingerprint:
                if record_fingerprint in seen_fingerprints:
                    continue

                seen_fingerprints.add(record_fingerprint)

        unique_records.append(record)

    return unique_records
