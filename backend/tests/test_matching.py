from ml.matching import JobRecord, Recommender, skill_overlap


def test_skill_overlap_matches_roadmap_example():
    score, matched, missing = skill_overlap(
        ["Python", "SQL", "Pandas", "Machine Learning"],
        ["Python", "SQL", "Machine Learning", "FastAPI", "Docker"])
    assert round(score, 2) == 0.6
    assert missing == ["FastAPI", "Docker"]


def test_ranking_prefers_better_skill_match():
    jobs = [JobRecord(1, ["Java", "Spring Boot"], "java spring developer"),
            JobRecord(2, ["Python", "SQL", "Pandas"], "python data analyst sql pandas")]
    top = Recommender(jobs).score(["Python", "SQL", "Pandas"], "data analyst")[0]
    assert top["job_id"] == 2 and top["score"] > 50
