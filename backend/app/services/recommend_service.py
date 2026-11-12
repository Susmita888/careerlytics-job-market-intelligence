"""Builds (and caches) the Recommender from the jobs table, and shapes API responses."""
import threading

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Job, Resume, SavedJob, User
from ..schemas import JobOut
from ml.matching import JobRecord, Recommender, explain

_lock = threading.Lock()
_cache: dict = {"key": None, "rec": None}


def job_to_out(job: Job, saved_ids: set[int] | None = None) -> JobOut:
    return JobOut(
        id=job.id, title=job.title, role_family=job.role_family, company=job.company,
        location=job.location, job_type=job.job_type, experience_level=job.experience_level,
        salary_min=job.salary_min, salary_max=job.salary_max, posted_date=job.posted_date,
        url=job.url, source=job.source, skills=[s.name for s in job.skills],
        saved=bool(saved_ids and job.id in saved_ids),
    )


def get_recommender(db: Session) -> Recommender:
    key = (db.query(func.count(Job.id)).scalar(), db.query(func.max(Job.id)).scalar())
    with _lock:
        if _cache["key"] != key:
            jobs = (
    db.query(Job)
    .order_by(Job.posted_date.desc().nullslast(), Job.id.desc())
    .limit(3000)
    .all()
)
            recs = [JobRecord(j.id, [s.name for s in j.skills], f"{j.title}. {j.description}") for j in jobs]
            _cache.update(key=key, rec=Recommender(recs, settings.use_embeddings, settings.embedding_model))
        return _cache["rec"]


def user_inputs(db: Session, user: User) -> tuple[list[str], str]:
    """Skills (profile) and free text (latest resume + target role) used for matching."""
    skills = list(user.profile.skills or [])
    latest = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()).first()
    text = ((latest.text if latest else "") + " " + (user.profile.target_role or "")).strip()
    return skills, text


def recommend(db: Session, user: User, limit: int = 20, location: str | None = None):
    skills, text = user_inputs(db, user)
    rec = get_recommender(db)
    scored = rec.score(skills, text, top_k=500)
    ids = [r["job_id"] for r in scored]
    jobs = {j.id: j for j in db.query(Job).filter(Job.id.in_(ids[: max(limit * 5, 200)])).all()}
    saved = {s.job_id for s in db.query(SavedJob).filter(SavedJob.user_id == user.id)}
    out = []
    for r in scored:
        job = jobs.get(r["job_id"])
        if not job:
            continue
        if location and location.strip().lower() not in (job.location or "").lower():
            continue
        out.append({**r, "job": job_to_out(job, saved), "explanation": explain(r)})
        if len(out) >= limit:
            break
    return out
