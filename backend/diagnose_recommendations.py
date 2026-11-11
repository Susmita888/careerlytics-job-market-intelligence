
from app.database import SessionLocal
from app.models import Job, User
from app.services.recommend_service import recommend

db = SessionLocal()

try:
    # 1. Job source distribution
    print("\n--- JOB SOURCE DISTRIBUTION ---")

    sources = db.query(Job.source).distinct().all()

    for (source,) in sources:
        source_jobs = db.query(Job).filter(Job.source == source).all()
        with_skills = sum(1 for j in source_jobs if j.skills)

        print(
            source,
            "| Total:", len(source_jobs),
            "| With skills:", with_skills,
            "| Without skills:", len(source_jobs) - with_skills
        )

    # 2. User recommendation diagnostic
    print("\n--- USER RECOMMENDATION DIAGNOSTIC ---")

    users = db.query(User).all()
    all_jobs = db.query(Job).all()

    for user in users:
        print("\nUser ID:", user.id)
        print("Profile skills:", user.profile.skills or [])

        results = recommend(db, user, limit=50)

        print("Recommendations:", len(results))

        missing_count = sum(
            1 for r in results if r["missing_skills"]
        )

        print("Jobs with missing skills:", missing_count)
        print("\nFirst 15 recommendations:")

        for r in results[:15]:
            print(
                r["job"].title,
                "| Matched:", r["matched_skills"],
                "| Missing:", r["missing_skills"],
                "| Score:", r["score"]
            )

        # 3. Missing skills across all jobs
        print("\n--- JOB SKILL COVERAGE ---")

        profile_skills = {
            s.lower() for s in (user.profile.skills or [])
        }

        missing_counter = {}

        for job in all_jobs:
            job_skills = {s.name.lower() for s in job.skills}

            for skill in job_skills - profile_skills:
                missing_counter[skill] = (
                    missing_counter.get(skill, 0) + 1
                )

        print("\nTop 20 missing skills across all jobs:")

        for skill, count in sorted(
            missing_counter.items(),
            key=lambda x: x[1],
            reverse=True
        )[:20]:
            print(skill, ":", count)

finally:
    db.close()
