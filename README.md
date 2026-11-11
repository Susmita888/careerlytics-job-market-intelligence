# Careerlytics – AI-Powered Job Market Intelligence Platform

Careerlytics is a full-stack job market intelligence platform
that analyzes job market trends, extracts skills from resumes,
recommends relevant jobs, and identifies skill gaps.

**Stack:** Python · FastAPI · SQLAlchemy · PostgreSQL (SQLite for quick local use) · scikit-learn · optional Sentence Transformers · PyMuPDF · React · Vite · Tailwind · Recharts · Docker

## Features
- **ETL pipeline:** Adzuna API, Kaggle-style CSVs, or generated demo data → clean → deduplicate → load
- **Skill extraction:** dictionary + alias + word-boundary regex (so "SQL" doesn't match "MySQL")
- **Resume analyzer:** PDF/TXT → skills, education, years of experience
- **Recommendations:** `Score = 0.5·skill overlap + 0.3·TF-IDF + 0.2·embeddings`, with explanations
- **Skill gap:** missing skills ranked by how many of your top matches require them
- **Analytics:** skill demand, salaries, cities, roles, monthly trends, role comparison
- JWT auth, hashed passwords, upload validation, pagination/filters, Swagger docs, 16 tests, CI

## Quick start (no Docker, SQLite)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env                                  # set JWT_SECRET
python -m etl.pipeline --source sample --count 600      # synthetic demo data
uvicorn app.main:app --reload                            # http://localhost:8000/docs

cd ../frontend
cp .env.example .env && npm install && npm run dev       # http://localhost:5173
```

## Docker (PostgreSQL)
```bash
cp .env.example .env            # set JWT_SECRET
docker compose up --build
docker compose exec backend python -m etl.pipeline --source sample
```

## Loading real data
```bash
# Kaggle: download a jobs CSV into backend/data/raw/, then
python -m etl.pipeline --source csv --path data/raw/jobs.csv --limit 2000
# Adzuna: put ADZUNA_APP_ID / ADZUNA_APP_KEY in .env, then
python -m etl.pipeline --source adzuna --limit 200
```
Column names are auto-mapped (title, company, location, description, salary, date, url). If your CSV uses other names, add them to `COLUMN_CANDIDATES` in `etl/extract.py`.

> **Data and terms.** The demo data is synthetic and labelled `synthetic-demo`; the UI says so. Check Adzuna's current terms (and any attribution/display rules) before storing, redistributing or publicly displaying live data. Use Kaggle data as history, not as evidence of current vacancies. Adzuna may return truncated descriptions, which limits skill extraction.

## Machine learning notes
- Weights (0.5/0.3/0.2) are starting points, not validated optima. `python -m ml.evaluate` computes precision@k against hand-labelled profiles. **On the synthetic demo data it will show ~1.00 because the data comes from the same templates; replace the profiles and data with real ones before drawing conclusions.**
- Semantic matching is off by default (keeps memory low on free hosts). Enable with `pip install sentence-transformers` and `USE_EMBEDDINGS=true`; weights renormalise automatically when it's off.
- A match score measures fit on paper. It is not a prediction of being hired.

## Tests
`cd backend && pytest -q`

## Privacy
Resume files are never stored: only extracted text and skills, deletable via `DELETE /resume` (UI: "Delete resume data"). Never commit `.env`, API keys or real resumes.

## Project layout
```
backend/  app/ (api, models, schemas, services)  ml/ (extraction, matching, evaluation)  etl/  tests/
frontend/ src/ (pages, components)
notebooks/  docs/  docker-compose.yml  .github/workflows/ci.yml
```
`ml/` and `etl/` live inside `backend/` so one Docker image and one import path serve the API and pipeline.

## Before deploying
- Replace `create_all` in `app/main.py` with Alembic migrations.
- Set a strong `JWT_SECRET`, restrict `CORS_ORIGINS`, and serve over HTTPS.
- Add rate limiting on `/auth/*` and `/resume/upload`.
- Free-tier hosts (Render/Railway/Vercel/Neon/Supabase) have changing limits. Check current ones.

## Roadmap
Scheduled ingestion (GitHub Actions cron), pgvector semantic search, demand forecasting once you have months of consistent data, saved-search alerts.
