def test_health_and_jobs(client):
    assert client.get("/health").json() == {"status": "ok"}
    page = client.get("/jobs?page_size=5").json()
    assert page["total"] >= 100 and len(page["items"]) == 5
    jid = page["items"][0]["id"]
    assert client.get(f"/jobs/{jid}").status_code == 200
    assert client.get("/jobs/99999999").status_code == 404


def test_filters(client):
    r = client.get("/jobs?skill=python&role=data scientist").json()
    assert all("Python" in j["skills"] and j["role_family"] == "data scientist" for j in r["items"])


def test_auth_flow(client):
    body = {"email": "a@example.com", "password": "supersecret1"}
    assert client.post("/auth/register", json=body).status_code == 201
    assert client.post("/auth/register", json=body).status_code == 409
    assert client.post("/auth/login", json={**body, "password": "wrong-pass1"}).status_code == 401
    tok = client.post("/auth/login", json=body).json()["access_token"]
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {tok}"}).json()["email"] == "a@example.com"
    assert client.get("/auth/me").status_code == 401


def test_short_password_rejected(client):
    assert client.post("/auth/register", json={"email": "b@example.com", "password": "short"}).status_code == 422


def test_resume_to_recommendations_and_gap(client, auth):
    resume = b"Jane Doe\nB.Tech in Computer Science. 3 years of experience.\nSkills: Python, SQL, Pandas, Machine Learning, Scikit-learn, Docker"
    r = client.post("/resume/upload", headers=auth, files={"file": ("cv.txt", resume, "text/plain")})
    assert r.status_code == 201
    data = r.json()
    assert "Python" in data["skills"] and "B.Tech" in data["education"] and data["experience_years"] == 3
    recs = client.get("/recommendations?limit=5", headers=auth).json()
    assert len(recs) == 5 and recs[0]["score"] >= recs[-1]["score"]
    assert recs[0]["explanation"]
    gap = client.get("/skills/gap", headers=auth).json()
    assert gap["priorities"] and not set(p["skill"] for p in gap["priorities"]) & set(gap["user_skills"])


def test_resume_validation(client, auth):
    bad_type = client.post("/resume/upload", headers=auth, files={"file": ("cv.exe", b"x" * 100, "application/octet-stream")})
    assert bad_type.status_code == 415
    fake_pdf = client.post("/resume/upload", headers=auth, files={"file": ("cv.pdf", b"not a pdf", "application/pdf")})
    assert fake_pdf.status_code == 400
    assert client.post("/resume/upload", files={"file": ("cv.txt", b"x", "text/plain")}).status_code == 401


def test_save_and_analytics(client, auth):
    jid = client.get("/jobs?page_size=1").json()["items"][0]["id"]
    assert client.post(f"/jobs/{jid}/save", headers=auth).status_code == 204
    assert [j["id"] for j in client.get("/jobs/saved", headers=auth).json()] == [jid]
    assert client.get("/analytics/overview").json()["demo_data"] is True
    assert client.get("/analytics/skills?role=data engineer").json()
    assert client.get("/analytics/salaries").json()
    assert "data scientist" in client.get("/analytics/role-compare").json()


def test_pdf_resume(client, auth):
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "John Roe. M.Sc Statistics. 5 years experience. Skills: Python, SQL, Spark, Airflow, ETL, Kafka")
    r = client.post("/resume/upload", headers=auth, files={"file": ("cv.pdf", doc.tobytes(), "application/pdf")})
    assert r.status_code == 201
    assert {"Python", "Spark", "Airflow"} <= set(r.json()["skills"])
