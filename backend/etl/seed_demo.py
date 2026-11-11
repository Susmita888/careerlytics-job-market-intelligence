
from app.database import Base, engine, SessionLocal
from app.models import Job
from etl.sample_data import generate
from etl.transform import transform, deduplicate
from etl.load import load_jobs


def seed_demo(count=600):
    """Generate and insert synthetic demo jobs safely."""

    print("Starting Skillmap demo data seeding...")

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Generate synthetic job postings.
        raw_records = generate(n=count, seed=42)

        # Apply the same transformations as the real ETL pipeline.
        transformed = [
            transform(record)
            for record in raw_records
        ]

        # Remove duplicate records.
        unique_records = deduplicate(transformed)

        # Insert jobs and their extracted skills.
        result = load_jobs(db, unique_records)

        total_demo_jobs = (
            db.query(Job)
            .filter(Job.source == "synthetic-demo")
            .count()
        )

        print("\nDemo data seeding completed!")
        print(f"Generated: {len(raw_records)}")
        print(f"Unique: {len(unique_records)}")
        print(f"Inserted: {result['inserted']}")
        print(f"Skipped: {result['skipped']}")
        print(f"Total demo jobs in database: {total_demo_jobs}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
