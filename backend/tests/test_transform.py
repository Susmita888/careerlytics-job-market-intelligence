from etl import transform as t


def test_clean_html_and_location():
    assert t.clean_html("<p>Hello&nbsp;<b>World</b></p><script>x()</script>") .startswith("Hello")
    assert t.normalize_location("Bangalore, Karnataka") == "Bengaluru"
    assert t.normalize_location(None) == "Unknown"


def test_salary_normalisation():
    assert t.normalize_salary(5, 8, "lpa") == (500_000, 800_000)
    assert t.normalize_salary(50, 80, "year") == (None, None)  # implausible


def test_dedup_keeps_distinct_vacancies():
    a = t.transform({"title": "Data Analyst", "company": "X", "location": "Pune", "description": "SQL reporting for sales"})
    b = t.transform({"title": "Data Analyst", "company": "X", "location": "Pune", "description": "Python ML for fraud models"})
    c = t.transform({"title": "Data Analyst", "company": "X", "location": "Pune", "description": "SQL reporting for sales"})
    assert len(t.deduplicate([a, b, c])) == 2
