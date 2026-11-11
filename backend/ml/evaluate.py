"""Tiny offline evaluation harness: precision@k of the recommender on hand-labelled profiles.

Usage (from backend/):  python -m ml.evaluate
Edit PROFILES so `relevant_roles` reflects what you consider a good match for each profile.
"""
from app.database import SessionLocal
from app.models import Job
from ml.matching import JobRecord, Recommender

PROFILES = [
    {"name": "Junior data analyst", "skills": ["Python", "SQL", "Pandas", "Excel", "Tableau"],
     "relevant_roles": {"data analyst", "data scientist"}},
    {"name": "Backend developer", "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"],
     "relevant_roles": {"backend developer", "full stack developer"}},
    {"name": "ML engineer", "skills": ["Python", "PyTorch", "Machine Learning", "Docker", "AWS"],
     "relevant_roles": {"ml engineer", "data scientist"}},
    {"name": "Data engineer", "skills": ["Python", "SQL", "Spark", "Airflow", "Kafka"],
     "relevant_roles": {"data engineer"}},
]


def precision_at_k(k: int = 10):
    db = SessionLocal()
    jobs = db.query(Job).all()
    recs = [JobRecord(j.id, [s.name for s in j.skills], f"{j.title} {j.description}") for j in jobs]
    by_id = {j.id: j for j in jobs}
    rec = Recommender(recs)
    for p in PROFILES:
        top = rec.score(p["skills"])[:k]
        hits = sum(1 for r in top if by_id[r["job_id"]].role_family in p["relevant_roles"])
        print(f"{p['name']:<22} precision@{k} = {hits / k:.2f}")
    db.close()


if __name__ == "__main__":
    precision_at_k()
