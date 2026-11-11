"""Synthetic demo postings so the app works before you download real data.

These are NOT real vacancies. They're generated from role templates and labelled
source='synthetic-demo'. Replace them with Kaggle/Adzuna data for any real analysis.
"""
import random
from datetime import date, timedelta

ROLES = {
    "Data Scientist": (["Python", "SQL", "Machine Learning", "Pandas", "Statistics", "Scikit-learn"],
                       ["Deep Learning", "PyTorch", "NLP", "AWS", "Spark", "TensorFlow"], (700_000, 2_200_000)),
    "Data Analyst": (["SQL", "Excel", "Python", "Tableau", "Statistics"],
                     ["Power BI", "Pandas", "R", "Snowflake", "BigQuery"], (400_000, 1_200_000)),
    "Machine Learning Engineer": (["Python", "Machine Learning", "PyTorch", "Docker"],
                                  ["TensorFlow", "MLOps", "AWS", "Kubernetes", "Hugging Face", "LLM", "FastAPI"], (900_000, 3_000_000)),
    "Python Developer": (["Python", "SQL", "Git", "REST API"],
                         ["Django", "Flask", "FastAPI", "PostgreSQL", "Docker", "Pytest", "Redis"], (400_000, 1_600_000)),
    "Backend Developer": (["Python", "REST API", "PostgreSQL", "Docker"],
                          ["FastAPI", "Django", "Redis", "AWS", "Microservices", "Kafka", "Java", "Node.js"], (600_000, 2_200_000)),
    "Data Engineer": (["Python", "SQL", "ETL", "Airflow"],
                      ["Spark", "Kafka", "Snowflake", "AWS", "dbt", "Data Warehousing", "BigQuery"], (700_000, 2_400_000)),
    "Full Stack Developer": (["JavaScript", "React", "REST API", "SQL"],
                             ["Node.js", "TypeScript", "Python", "PostgreSQL", "Docker", "Tailwind CSS", "MongoDB"], (500_000, 2_000_000)),
}
CITIES = ["Kolkata", "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Gurugram", "Chennai", "Remote"]
CITY_WEIGHTS = [1, 5, 3, 3, 2, 2, 2, 2]
COMPANIES = ["Nimbus Analytics", "Kalpa Systems", "Orbit Labs", "Brightwave Technologies",
             "Zenith Data", "Cobalt Software", "Meridian AI", "Pixelforge", "Tarang Digital", "Ledgerline"]
LEVELS = [("Fresher", 0.3, "entry-level, 0-1 years"), ("Mid", 0.5, "2-5 years"), ("Senior", 0.2, "senior, 6+ years")]


def generate(n: int = 600, seed: int = 42) -> list[dict]:
    rng = random.Random(seed)
    out = []
    for i in range(n):
        title, (core, extra, (lo, hi)) = rng.choice(list(ROLES.items()))
        level, _, level_txt = rng.choices(LEVELS, weights=[l[1] for l in LEVELS])[0]
        skills = core + rng.sample(extra, k=rng.randint(1, min(4, len(extra))))
        mult = {"Fresher": 0.6, "Mid": 1.0, "Senior": 1.6}[level]
        base = rng.uniform(lo, hi) * mult
        city = rng.choices(CITIES, weights=CITY_WEIGHTS)[0]
        prefix = {"Senior": "Senior ", "Fresher": "Junior " if rng.random() < .5 else ""}.get(level, "")
        desc = (f"We are hiring a {prefix}{title} ({level_txt}). You will build and ship production systems "
                f"with our team. Required skills: {', '.join(skills)}. "
                f"Responsibilities include collaborating with product teams, writing clean, tested code, "
                f"and documenting your work. Reference no. {i}.")
        out.append({
            "source": "synthetic-demo", "source_id": f"demo-{i}", "title": f"{prefix}{title}",
            "company": rng.choice(COMPANIES), "location": city, "description": desc,
            "salary_min": round(base * 0.85, -3) if rng.random() > 0.2 else None,
            "salary_max": round(base * 1.15, -3) if rng.random() > 0.2 else None,
            "job_type": rng.choice(["Full-time", "Full-time", "Full-time", "Contract"]),
            "experience_level": level,
            "posted_date": (date.today() - timedelta(days=rng.randint(0, 120))).isoformat(),
            "url": "",
        })
    return out
