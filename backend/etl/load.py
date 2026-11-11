from sqlalchemy.exc import SQLAlchemyError

from app.models import Job, Skill

from ml.skill_extractor import extract_skills
from ml.skills_dictionary import CATEGORY


ALLOWED_SOURCES = {
    "indian-kaggle",
    "synthetic-demo"
}


def get_or_create_skill(db, skill_name):
    """Find an existing skill or create it."""

    skill_name = str(skill_name).strip()

    if not skill_name:
        return None

    skill = (
        db.query(Skill)
        .filter(Skill.name == skill_name)
        .first()
    )

    if skill:
        return skill

    category = CATEGORY.get(skill_name, "Other")

    skill = Skill(
        name=skill_name,
        category=category
    )

    db.add(skill)
    db.flush()

    return skill


def load_jobs(db, records):
    """Insert Indian and synthetic job records."""

    inserted = 0
    skipped = 0

    try:
        for record in records:

            source = record.get("source")

            # Keep the loader limited to the two intended sources.
            if source not in ALLOWED_SOURCES:
                skipped += 1
                continue

            source_id = record.get("source_id")
            job_fingerprint = record.get("fingerprint")

            # Check for an existing record by source and source ID.
            existing = None

            if source_id:
                existing = (
                    db.query(Job)
                    .filter(
                        Job.source == source,
                        Job.source_id == source_id
                    )
                    .first()
                )

            # Check fingerprint within the same source.
            if not existing and job_fingerprint:
                existing = (
                    db.query(Job)
                    .filter(
                        Job.source == source,
                        Job.fingerprint == job_fingerprint
                    )
                    .first()
                )

            if existing:
                skipped += 1
                continue

            job = Job(
                source=source,
                source_id=source_id,
                fingerprint=job_fingerprint,
                title=record.get("title"),
                role_family=record.get("role_family"),
                company=record.get("company"),
                location=record.get("location"),
                job_type=record.get("job_type"),
                experience_level=record.get("experience_level"),
                salary_min=record.get("salary_min"),
                salary_max=record.get("salary_max"),
                description=record.get("description"),
                posted_date=record.get("posted_date"),
                url=record.get("url")
            )

            # Extract skills from the job description.
            skills = extract_skills(
                record.get("description") or ""
            )

            for skill_name in skills:
                skill = get_or_create_skill(
                    db,
                    skill_name
                )

                if skill and skill not in job.skills:
                    job.skills.append(skill)

            db.add(job)
            inserted += 1

        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    return {
        "inserted": inserted,
        "skipped": skipped
    }