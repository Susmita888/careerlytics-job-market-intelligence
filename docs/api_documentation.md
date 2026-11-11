# API reference
Interactive docs: run the backend and open http://localhost:8000/docs (Swagger UI).

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /auth/register, /auth/login | – | Create account / get JWT |
| GET | /auth/me | ✔ | Current user |
| GET | /jobs | – | List with filters: q, location, role, skill, experience, min_salary, page, page_size |
| GET | /jobs/{id} | – | Job detail |
| GET | /jobs/saved | ✔ | Saved jobs |
| POST/DELETE | /jobs/{id}/save | ✔ | Save / unsave |
| GET/PUT | /profile | ✔ | Skills, experience, target role |
| POST | /resume/upload | ✔ | PDF/TXT upload (≤5 MB) → skills, education, experience |
| GET/DELETE | /resume/latest, /resume | ✔ | Read / delete resume data |
| GET | /recommendations | ✔ | Ranked jobs with matched/missing skills and explanation |
| GET | /skills/gap | ✔ | Missing skills ranked by demand among your top matches |
| GET | /analytics/overview, skills, salaries, locations, roles, trends, role-compare | – | Market analytics |
