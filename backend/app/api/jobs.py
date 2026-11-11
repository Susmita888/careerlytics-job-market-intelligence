from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import Job, SavedJob, Skill, User
from ..schemas import JobDetail, JobOut, JobPage
from ..services.recommend_service import job_to_out

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=JobPage)
def list_jobs(
    q: str | None = None, location: str | None = None, role: str | None = None,
    skill: str | None = None, experience: str | None = None,
    min_salary: float | None = Query(None, ge=0),
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Job)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(or_(func.lower(Job.title).like(like), func.lower(Job.company).like(like),
                                 func.lower(Job.description).like(like)))
    if location:
        query = query.filter(func.lower(Job.location) == location.lower())
    if role:
        query = query.filter(Job.role_family == role.lower())
    if experience:
        query = query.filter(func.lower(Job.experience_level) == experience.lower())
    if skill:
        query = query.filter(Job.skills.any(func.lower(Skill.name) == skill.lower()))
    if min_salary:
        query = query.filter(Job.salary_max >= min_salary)
    total = query.count()
    rows = query.order_by(Job.posted_date.desc().nullslast(), Job.id.desc()) \
        .offset((page - 1) * page_size).limit(page_size).all()
    return JobPage(items=[job_to_out(j) for j in rows], total=total, page=page, page_size=page_size)


@router.get("/saved", response_model=list[JobOut])
def saved_jobs(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(SavedJob).filter(SavedJob.user_id == user.id).order_by(SavedJob.created_at.desc()).all()
    return [job_to_out(s.job, {s.job_id}) for s in rows]


@router.get("/{job_id}", response_model=JobDetail)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return JobDetail(**job_to_out(job).model_dump(), description=job.description)


@router.post("/{job_id}/save", status_code=204)
def save_job(job_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if not db.get(Job, job_id):
        raise HTTPException(404, "Job not found")
    if not db.query(SavedJob).filter_by(user_id=user.id, job_id=job_id).first():
        db.add(SavedJob(user_id=user.id, job_id=job_id))
        db.commit()


@router.delete("/{job_id}/save", status_code=204)
def unsave_job(job_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.query(SavedJob).filter_by(user_id=user.id, job_id=job_id).delete()
    db.commit()
