
import os
import tempfile

_tmp = tempfile.mkdtemp()

# Configure the test database before importing app modules.
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["JWT_SECRET"] = "test-secret"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from etl import load, sample_data, transform


@pytest.fixture(scope="session")
def client():
    Base.metadata.create_all(bind=engine)

    # Generate the existing synthetic demo records.
    recs = [
        t
        for t in map(transform.transform, sample_data.generate(150))
        if t
    ]

    # Add a guaranteed Data Engineer test vacancy.
    data_engineer_job = transform.transform({
        "source": "synthetic-demo",
        "source_id": "test-data-engineer-001",
        "title": "Data Engineer",
        "company": "Test Analytics Company",
        "location": "Bengaluru",
        "description": (
            "Data Engineer responsible for SQL, Python, "
            "ETL pipelines, Airflow and Spark."
        ),
        "salary_min": 800000,
        "salary_max": 1200000,
        "experience": "2 years"
    })

    if data_engineer_job:
        recs.append(data_engineer_job)

    recs = transform.deduplicate(recs)

    with SessionLocal() as db:
        load.load_jobs(db, recs)

    with TestClient(app) as c:
        yield c


@pytest.fixture()
def auth(client):
    import uuid

    email = f"{uuid.uuid4().hex[:8]}@example.com"

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "supersecret1",
            "full_name": "T"
        }
    )

    return {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }
