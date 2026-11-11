from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]


def clean_text(value):
    """Convert missing values to None and clean text."""
    if value is None or pd.isna(value):
        return None

    value = str(value).strip()
    return value if value else None


def clean_id(value):
    """Convert Excel IDs into clean strings."""
    if value is None or pd.isna(value):
        return None

    if isinstance(value, float) and value.is_integer():
        return str(int(value))

    return str(value).strip() or None


def clean_salary(value):
    """Return a positive numeric salary or None."""
    if value is None or pd.isna(value):
        return None

    try:
        salary = float(value)
    except (TypeError, ValueError):
        return None

    return salary if salary > 0 else None


def extract_excel(
    path="data/raw/indian-job-market-dataset-2025.xlsx",
    limit=None
):
    """Extract Indian job postings from the Excel dataset."""

    file_path = Path(path)

    if not file_path.is_absolute():
        file_path = BASE_DIR / file_path

    if not file_path.exists():
        raise FileNotFoundError(
            f"Indian job dataset not found: {file_path}"
        )

    df = pd.read_excel(
        file_path,
        sheet_name="Sheet1",
        nrows=limit,
        engine="openpyxl"
    )

    if df.empty:
        raise ValueError("The Excel dataset is empty.")

    required_columns = [
        "title",
        "jobId",
        "currency",
        "companyName",
        "location",
        "minimumSalary",
        "maximumSalary",
        "experience",
        "tagsAndSkills",
        "jobDescription"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    records = []

    for _, row in df.iterrows():

        title = clean_text(row.get("title"))

        if not title:
            continue

        currency = clean_text(row.get("currency"))
        currency = currency.upper() if currency else None

        # The dataset's salary values are already annual INR.
        if currency == "INR":
            salary_min = clean_salary(
                row.get("minimumSalary")
            )
            salary_max = clean_salary(
                row.get("maximumSalary")
            )
        else:
            salary_min = None
            salary_max = None

        # Handle reversed salary ranges.
        if (
            salary_min is not None
            and salary_max is not None
            and salary_min > salary_max
        ):
            salary_min, salary_max = salary_max, salary_min

        description = clean_text(
            row.get("jobDescription")
        ) or ""

        skills = clean_text(
            row.get("tagsAndSkills")
        )

        if skills:
            description += "\nRequired skills: " + skills

        records.append({
            "source": "indian-kaggle",
            "source_id": clean_id(row.get("jobId")),
            "title": title,
            "company": clean_text(row.get("companyName")),
            "location": clean_text(row.get("location")),
            "description": description,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "salary_period": "year",
            "salary_currency": currency,
            "currency_factor": 1.0,
            "job_type": None,
            "experience_level": clean_text(
                row.get("experience")
            ),
            # jobUploaded contains relative text such as
            # "6 Days Ago", so we do not treat it as a date.
            "posted_date": None,
            "url": None
        })

    print(
        f"Extracted {len(records)} Indian job records "
        f"from {file_path.name}"
    )

    return records