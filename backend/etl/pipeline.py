import argparse
import json
from datetime import datetime
from pathlib import Path

from app.database import Base, engine, SessionLocal

from etl import extract
from etl import transform
from etl import load


BASE_DIR = Path(__file__).resolve().parents[1]

DEFAULT_DATASET = (
    "data/raw/indian-job-market-dataset-2025.xlsx"
)


def run(path=DEFAULT_DATASET, limit=None):
    """Run the Indian Job Market ETL pipeline."""

    print("\nStarting Indian Job Market ETL Pipeline")

    # Create missing database tables.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # STEP 1: Extract
        print("\n[1/4] Extracting Indian job data...")

        raw_records = extract.extract_excel(
            path=path,
            limit=limit
        )

        # STEP 2: Transform
        print("\n[2/4] Cleaning and transforming records...")

        transformed_records = []

        for record in raw_records:
            cleaned = transform.transform(record)

            if cleaned:
                transformed_records.append(cleaned)

        # STEP 3: Deduplicate
        print("\n[3/4] Removing duplicate records...")

        unique_records = transform.deduplicate(
            transformed_records
        )

        # STEP 4: Load
        print("\n[4/4] Saving Indian jobs to database...")

        result = load.load_jobs(
            db,
            unique_records
        )

        # Count records without deleting anything.
        indian_count = (
            db.query(load.Job)
            .filter(load.Job.source == "indian-kaggle")
            .count()
        )

        synthetic_count = (
            db.query(load.Job)
            .filter(load.Job.source == "synthetic-demo")
            .count()
        )

        stats = {
            "source": "indian-kaggle",
            "dataset": str(path),
            "run_at": datetime.now().isoformat(),
            "extracted": len(raw_records),
            "transformed": len(transformed_records),
            "unique": len(unique_records),
            "inserted": result["inserted"],
            "skipped": result["skipped"],
            "indian_jobs_in_database": indian_count,
            "synthetic_jobs_preserved": synthetic_count
        }

        # Save ETL statistics.
        output_dir = BASE_DIR / "data" / "processed"
        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        output_file = output_dir / "last_run.json"

        with open(
            output_file,
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                stats,
                file,
                indent=4
            )

        print("\nETL Pipeline Completed Successfully!")
        print(json.dumps(stats, indent=4))

        return stats

    finally:
        db.close()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Indian Job Market ETL Pipeline"
    )

    parser.add_argument(
        "--path",
        default=DEFAULT_DATASET,
        help="Path to the Indian Excel dataset"
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of Excel rows to process"
    )

    args = parser.parse_args()

    run(
        path=args.path,
        limit=args.limit
    )