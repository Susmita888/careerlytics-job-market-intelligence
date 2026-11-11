from ml.skill_extractor import extract_skills


def test_boundaries_do_not_leak():
    assert "SQL" not in extract_skills("We use MySQL daily")
    assert "MySQL" in extract_skills("We use MySQL daily")
    assert "Go" not in extract_skills("A good engineer with great attitude")


def test_aliases_and_symbols():
    found = extract_skills("Experience with Postgres, golang, C++, CI/CD and Node.js")
    for s in ["PostgreSQL", "Go", "C++", "CI/CD", "Node.js"]:
        assert s in found


def test_case_insensitive_and_empty():
    assert "Python" in extract_skills("python and PYTHON")
    assert extract_skills("") == []
