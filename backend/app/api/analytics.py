
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
import re

from ..database import get_db
from ..models import Job, Skill, job_skills


router = APIRouter(prefix="/analytics", tags=["analytics"])


# ---------------------------------------------------------
# ROLE FILTER ALIASES
# ---------------------------------------------------------

ROLE_FILTER_ALIASES = {
    "data scientist": ["data scientist"],
    "data analyst": ["data analyst"],
    "data engineer": ["data engineer"],
    "ml engineer": ["ml engineer", "machine learning engineer"],
    "backend developer": ["backend developer"],
    "frontend developer": ["frontend developer"],
    "full stack developer": ["full stack developer"],

    "data science": [
        "data science",
        "data scientist",
        "data analyst",
        "data engineer",
        "ml engineer",
        "machine learning engineer",
    ],

    "software development": [
        "software development",
        "software engineer",
        "software developer",
        "backend developer",
        "frontend developer",
        "full stack developer",
    ],

    "cybersecurity": ["cybersecurity"],

    "cloud and devops": [
        "cloud and devops",
        "cloud & devops",
        "devops engineer",
    ],

    "testing and qa": [
        "testing and qa",
        "testing & qa",
    ],

    "it support": ["it support"],

    "marketing & communications": [
        "marketing & communications",
        "marketing and communications",
    ],

    "marketing and communications": [
        "marketing & communications",
        "marketing and communications",
    ],

    "human resources": ["human resources"],

    "finance & accounting": [
        "finance & accounting",
        "finance and accounting",
    ],

    "finance and accounting": [
        "finance & accounting",
        "finance and accounting",
    ],

    "healthcare": ["healthcare"],
    "legal": ["legal"],
    "engineering": ["engineering"],
    "customer support": ["customer support"],

    "hospitality & services": [
        "hospitality & services",
        "hospitality and services",
    ],

    "fitness & wellness": [
        "fitness & wellness",
        "fitness and wellness",
    ],

    "education & training": [
        "education & training",
        "education and training",
    ],

    "media & entertainment": [
        "media & entertainment",
        "media and entertainment",
    ],

    "manufacturing & production": [
        "manufacturing & production",
        "manufacturing and production",
    ],

    "administration": ["administration"],

    "sales & marketing": [
        "sales & marketing",
        "sales and marketing",
        "sales andmarketing",
    ],

    "other": ["other"],
}


# ---------------------------------------------------------
# STANDARD ROLE DISPLAY NAMES
# ---------------------------------------------------------

ROLE_DISPLAY_NAMES = {
    "administration": "Administration",
    "cloudanddevops": "Cloud and DevOps",
    "customersupport": "Customer Support",
    "cybersecurity": "Cybersecurity",
    "datascience": "Data Science",
    "educationtraining": "Education & Training",
    "engineering": "Engineering",
    "financeaccounting": "Finance & Accounting",
    "fitnesswellness": "Fitness & Wellness",
    "healthcare": "Healthcare",
    "hospitalityservices": "Hospitality & Services",
    "humanresources": "Human Resources",
    "itsupport": "IT Support",
    "legal": "Legal",
    "manufacturingproduction": "Manufacturing & Production",
    "marketingcommunications": "Marketing & Communications",
    "mediaentertainment": "Media & Entertainment",
    "other": "Other",
    "salesandmarketing": "Sales & Marketing",
    "softwaredevelopment": "Software Development",
    "testingandqa": "Testing and QA",

    # Specific technical roles
    "backenddeveloper": "Backend Developer",
    "dataanalyst": "Data Analyst",
    "dataengineer": "Data Engineer",
    "datascientist": "Data Scientist",
    "devopsengineer": "DevOps Engineer",
    "frontenddeveloper": "Frontend Developer",
    "fullstackdeveloper": "Full Stack Developer",
    "mlengineer": "Machine Learning Engineer",
    "machinelearningengineer": "Machine Learning Engineer",
    "financeandaccounting": "Finance & Accounting",
}


# ---------------------------------------------------------
# ROLE NORMALIZATION
# ---------------------------------------------------------

def normalize_role(role: str) -> str:
    """Normalize role text for consistent comparisons."""
    return " ".join(str(role or "").strip().lower().split())


def display_role(role: str) -> str:
    """Convert role names into consistent display labels."""

    if not role:
        return "Other"

    normalized = re.sub(
        r"[^a-z0-9]",
        "",
        str(role).strip().lower()
    )

    return ROLE_DISPLAY_NAMES.get(
        normalized,
        str(role).strip()
    )


def apply_role_filter(query, role: str | None):
    """Apply a role filter using known role aliases."""

    if not role or not role.strip():
        return query

    normalized = normalize_role(role)

    aliases = ROLE_FILTER_ALIASES.get(
        normalized,
        [normalized]
    )

    aliases = [
        normalize_role(alias)
        for alias in aliases
    ]

    return query.filter(
        func.lower(func.trim(Job.role_family)).in_(aliases)
    )


# ---------------------------------------------------------
# MEDIAN CALCULATION
# ---------------------------------------------------------

def _median(values: list[float]) -> float | None:
    values = sorted(values)

    if not values:
        return None

    mid = len(values) // 2

    if len(values) % 2:
        return values[mid]

    return (values[mid - 1] + values[mid]) / 2


# ---------------------------------------------------------
# 1. MARKET OVERVIEW
# ---------------------------------------------------------

@router.get("/overview")
def overview(db: Session = Depends(get_db)):

    total = (
        db.query(func.count(Job.id)).scalar() or 0
    )

    with_salary = (
        db.query(func.count(Job.id))
        .filter(Job.salary_min.isnot(None))
        .scalar()
        or 0
    )

    fresher = (
        db.query(func.count(Job.id))
        .filter(
            func.lower(Job.experience_level) == "fresher"
        )
        .scalar()
        or 0
    )

    sources = dict(
        db.query(Job.source, func.count(Job.id))
        .group_by(Job.source)
        .all()
    )

    synthetic_jobs = sources.get("synthetic-demo", 0)

    companies = (
        db.query(func.count(func.distinct(Job.company)))
        .scalar()
        or 0
    )

    cities = (
        db.query(func.count(func.distinct(Job.location)))
        .filter(Job.location.isnot(None))
        .scalar()
        or 0
    )

    return {
        "total_jobs": total,
        "companies": companies,
        "cities": cities,

        "salary_coverage_pct": round(
            with_salary / total * 100, 1
        ) if total else 0,

        "fresher_friendly_pct": round(
            fresher / total * 100, 1
        ) if total else 0,

        "sources": sources,
        "synthetic_jobs": synthetic_jobs,
        "demo_data": synthetic_jobs > 0,
        "demo_only": total > 0 and synthetic_jobs == total,
    }


# ---------------------------------------------------------
# 2. SKILL DEMAND
# ---------------------------------------------------------

@router.get("/skills")
def skill_demand(
    role: str | None = None,
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db),
):

    q = (
        db.query(
            Skill.name,
            Skill.category,
            func.count(func.distinct(job_skills.c.job_id)),
        )
        .join(
            job_skills,
            job_skills.c.skill_id == Skill.id
        )
        .join(
            Job,
            Job.id == job_skills.c.job_id
        )
    )

    base = db.query(func.count(Job.id))

    if role:
        q = apply_role_filter(q, role)
        base = apply_role_filter(base, role)

    total = base.scalar() or 0

    rows = (
        q.group_by(
            Skill.id,
            Skill.name,
            Skill.category
        )
        .order_by(
            func.count(func.distinct(job_skills.c.job_id)).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "skill": name,
            "category": category,
            "jobs": count,
            "share_pct": round(
                count / total * 100, 1
            ) if total else 0,
        }
        for name, category, count in rows
    ]


# ---------------------------------------------------------
# 3. SALARY INSIGHTS
# ---------------------------------------------------------

@router.get("/salaries")
def salaries(db: Session = Depends(get_db)):

    groups: dict[str, list[float]] = {}

    rows = (
        db.query(
            Job.role_family,
            Job.salary_min,
            Job.salary_max
        )
        .filter(
            Job.salary_min.isnot(None),
            Job.salary_min > 0,
        )
        .all()
    )

    for family, low, high in rows:

        role = display_role(family)

        salary_value = (low + (high or low)) / 2

        groups.setdefault(role, []).append(
            salary_value
        )

    results = [
        {
            "role": role,
            "median": _median(values),
            "min": min(values),
            "max": max(values),
            "n": len(values),
        }
        for role, values in groups.items()
    ]

    return sorted(
        results,
        key=lambda item: item["median"] or 0,
        reverse=True,
    )


# ---------------------------------------------------------
# 4. LOCATION INSIGHTS
# ---------------------------------------------------------

@router.get("/locations")
def locations(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):

    rows = (
        db.query(
            Job.location,
            func.count(Job.id)
        )
        .filter(
            Job.location.isnot(None),
            func.trim(Job.location) != ""
        )
        .group_by(Job.location)
        .order_by(
            func.count(Job.id).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "location": location,
            "jobs": count,
        }
        for location, count in rows
    ]


# ---------------------------------------------------------
# 5. ROLE DISTRIBUTION
# ---------------------------------------------------------

@router.get("/roles")
def roles(db: Session = Depends(get_db)):

    rows = (
        db.query(
            Job.role_family,
            func.count(Job.id)
        )
        .group_by(Job.role_family)
        .order_by(
            func.count(Job.id).desc()
        )
        .all()
    )

    # Combine different database spellings
    # into one standardized display category.

    role_groups: dict[str, int] = {}

    for role, count in rows:

        formatted_role = display_role(role)

        role_groups[formatted_role] = (
            role_groups.get(formatted_role, 0) + count
        )

    results = [
        {
            "role": role,
            "jobs": count,
        }
        for role, count in role_groups.items()
    ]

    return sorted(
        results,
        key=lambda item: item["jobs"],
        reverse=True
    )


# ---------------------------------------------------------
# 6. HIRING TRENDS
# ---------------------------------------------------------

@router.get("/trends")
def trends(db: Session = Depends(get_db)):
    """Monthly posting counts from non-demo records."""

    out: dict[str, int] = {}

    rows = (
        db.query(Job.posted_date)
        .filter(
            Job.posted_date.isnot(None),
            Job.source != "synthetic-demo",
        )
        .all()
    )

    for (posted_date,) in rows:

        month = posted_date.strftime("%Y-%m")

        out[month] = out.get(month, 0) + 1

    return [
        {
            "month": month,
            "jobs": count,
        }
        for month, count in sorted(out.items())
    ]


# ---------------------------------------------------------
# 7. ROLE COMPARISON
# ---------------------------------------------------------

@router.get("/role-compare")
def role_compare(
    roles: list[str] = Query(
        default=[
            "data scientist",
            "data engineer",
            "backend developer",
            "ml engineer",
        ]
    ),
    top: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):

    result = {}

    for role in roles:

        total_query = db.query(func.count(Job.id))

        total = (
            apply_role_filter(total_query, role).scalar()
            or 0
        )

        skills_query = (
            db.query(
                Skill.name,
                func.count(func.distinct(job_skills.c.job_id)),
            )
            .join(
                job_skills,
                job_skills.c.skill_id == Skill.id
            )
            .join(
                Job,
                Job.id == job_skills.c.job_id
            )
        )

        rows = (
            apply_role_filter(skills_query, role)
            .group_by(
                Skill.id,
                Skill.name
            )
            .order_by(
                func.count(func.distinct(job_skills.c.job_id)).desc()
            )
            .limit(top)
            .all()
        )

        result[role] = {
            "jobs": total,
            "top_skills": [
                {
                    "skill": name,
                    "share_pct": round(
                        count / total * 100, 1
                    ) if total else 0,
                }
                for name, count in rows
            ],
        }

    return result
