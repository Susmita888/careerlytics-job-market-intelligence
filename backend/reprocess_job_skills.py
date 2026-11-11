
"""
Safely reprocess skills for existing Indian Kaggle jobs.

Default: dry run (no database changes).
Apply changes: python reprocess_job_skills.py --apply
"""

import argparse
from collections import Counter

from app.database import SessionLocal
from app.models import Job, Skill
from ml.skill_extractor import extract_skills
from ml.skills_dictionary import CATEGORY


SOURCE = "indian-kaggle"


def get_or_create_skill(db, name):
    skill = db.query(Skill).filter(Skill.name == name).first()

    if skill:
        # Keep its category aligned with the current dictionary.
        skill.category = CATEGORY.get(name, "Other")
        return skill

    skill = Skill(
        name=name,
        category=CATEGORY.get(name, "Other")
    )
    db.add(skill)
    db.flush()
    return skill


def reprocess(apply_changes=False):
    db = SessionLocal()

    try:
        jobs = (
            db.query(Job)
            .filter(Job.source == SOURCE)
            .order_by(Job.id)
            .all()
        )

        print(f"\nIndian Kaggle jobs found: {len(jobs)}")

        processed = 0
        jobs_with_skills = 0
        total_associations = 0
        changed_jobs = 0
        added_associations = 0
        removed_associations = 0
        skill_counts = Counter()

        for job in jobs:
            extracted = extract_skills(job.description or "")
            extracted_set = set(extracted)

            existing_set = {skill.name for skill in job.skills}

            additions = extracted_set - existing_set
            removals = existing_set - extracted_set

            if removals:
                print("\nJOB:", job.title)
                print("Existing skills:", sorted(existing_set))
                print("Newly detected:", sorted(extracted_set))
                print("Would remove:", sorted(removals))

            processed += 1

            if extracted_set:
                jobs_with_skills += 1

            total_associations += len(extracted_set)
            skill_counts.update(extracted)

            if additions or removals:
                changed_jobs += 1
                added_associations += len(additions)
                removed_associations += len(removals)

                if apply_changes:
                    for name in sorted(additions):
                        skill = get_or_create_skill(db, name)

                        if skill not in job.skills:
                            job.skills.append(skill)

        print("\n========== REPROCESSING REPORT ==========")
        print(f"Jobs processed: {processed}")
        print(f"Jobs with detected skills: {jobs_with_skills}")
        print(f"Detected skill associations: {total_associations}")
        print(f"Jobs whose associations would change: {changed_jobs}")
        print(f"Associations to add: {added_associations}")
        print(f"Associations to remove: {removed_associations}")

        print("\nTop 30 detected skills:")
        for name, count in skill_counts.most_common(30):
            print(f"{name}: {count}")

        if apply_changes:
            db.commit()
            print("\nSUCCESS: Skill associations updated.")
        else:
            db.rollback()
            print("\nDRY RUN: No database changes were made.")
            print("Review the report before running with --apply.")

        print("=========================================\n")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply the skill association updates."
    )
    args = parser.parse_args()

    reprocess(apply_changes=args.apply)
