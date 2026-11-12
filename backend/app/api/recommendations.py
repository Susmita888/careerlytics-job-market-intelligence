from collections import Counter
from statistics import mean

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session 
from sqlalchemy import func

from ..database import get_db
from ..deps import current_user
from ..models import User , Job, Skill, job_skills
from ..schemas import (
    GapItem,
    GapOut,
    Recommendation,
    RoleOption,
    RoleGapCompareIn,
    RoleGapItem,
    RoleGapResult,
    RoleGapCompareOut,
)
from ..services.recommend_service import recommend

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=list[Recommendation])
def recommendations(limit: int = Query(20, ge=1, le=100), location: str | None = None,
                    user: User = Depends(current_user), db: Session = Depends(get_db)):
    return recommend(db, user, limit, location)


@router.get("/skills/gap", response_model=GapOut)
def skill_gap(top_n: int = Query(20, ge=5, le=50), user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Skills you're missing, ranked by how many of your best-matching jobs ask for them."""
    top = recommend(db, user, top_n)
    counter = Counter(s for r in top for s in r["missing_skills"])
    n = len(top) or 1
    items = [GapItem(skill=s, jobs_requiring=c, share_of_top_matches=round(c / n * 100, 1),
                     reason=f"Required by {c} of your top {len(top)} matches")
             for s, c in counter.most_common(10)]
    return GapOut(user_skills=user.profile.skills or [], top_matches_considered=len(top),
                  average_match_score=round(mean(r["score"] for r in top), 1) if top else 0.0, priorities=items)



@router.get("/skills/roles", response_model=list[RoleOption])
def available_roles(db: Session = Depends(get_db)):
    """Return selectable job roles with their job counts."""

    normalized_role = func.lower(func.trim(Job.role_family))

    rows = (
        db.query(
            normalized_role.label("role"),
            func.count(Job.id).label("job_count"),
        )
        .filter(
            Job.role_family.isnot(None),
            normalized_role != "other",
            func.trim(Job.role_family) != "",
        )
        .group_by(normalized_role)
        .order_by(func.count(Job.id).desc())
        .all()
    )

    return [
        RoleOption(
            value=role,
            label=role.title(),
            job_count=count,
        )
        for role, count in rows
    ]



@router.post("/skills/gap/compare", response_model=RoleGapCompareOut)
def compare_role_gaps(
    payload: RoleGapCompareIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    """Compare missing skills across multiple selected job roles."""

    selected_roles = list(dict.fromkeys(
        role.strip().lower()
        for role in payload.roles
        if role and role.strip()
    ))

    if len(selected_roles) < 2:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Please select at least two different roles."
        )

    if len(selected_roles) > 5:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="You can compare a maximum of five roles."
        )

    user_skills = user.profile.skills or [] if user.profile else []
    user_skill_set = {s.strip().lower() for s in user_skills}

    jobs = (
        db.query(Job)
        .filter(
            func.lower(func.trim(Job.role_family)).in_(selected_roles)
        )
        .all()
    )

    results = []
    missing_sets = []

    for role in selected_roles:
        role_jobs = [
            job for job in jobs
            if (job.role_family or "").strip().lower() == role
        ]

        skill_counts = Counter()
        skill_names = {}

        for job in role_jobs:
            job_skill_names = {
                skill.name.strip().lower(): skill.name.strip()
                for skill in job.skills
                if skill.name and skill.name.strip()
            }

            for normalized, display_name in job_skill_names.items():
                skill_names[normalized] = display_name
                skill_counts[normalized] += 1

        jobs_with_skills = sum(
            1 for job in role_jobs if job.skills
        )

        missing = {
            skill for skill in skill_counts
            if skill not in user_skill_set
        }
        missing_sets.append(missing)

        priorities = [
            RoleGapItem(
                skill=skill_names[skill],
                jobs_requiring=count,
                share_of_role_jobs=round(
                    count / jobs_with_skills * 100, 1
                ) if jobs_with_skills else 0
            )
            for skill, count in skill_counts.most_common()
            if skill in missing
        ]

        results.append(
            RoleGapResult(
                role=role,
                total_jobs=len(role_jobs),
                jobs_with_skills=jobs_with_skills,
                existing_skills=[
                    skill_names[s]
                    for s in skill_counts
                    if s in user_skill_set
                ],
                missing_skills=priorities
            )
        )

    common_missing = (
        set.intersection(*missing_sets)
        if missing_sets else set()
    )

    return RoleGapCompareOut(
        user_skills=user_skills,
        roles=results,
        common_missing_skills=sorted(common_missing)
    )
