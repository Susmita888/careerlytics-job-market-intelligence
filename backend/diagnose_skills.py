from collections import Counter

from etl.extract import extract_excel
from ml.skill_extractor import extract_skills

records = extract_excel(limit=500)

technical_keywords = [
    "software", "developer", "engineer", "data",
    "python", "java", "machine learning",
    "artificial intelligence", "cloud",
    "backend", "frontend", "devops", "analyst",
    "database", "cyber", "programmer"
]

counts = Counter()
total = 0

print("\n========== TECHNICAL JOB ANALYSIS ==========")

for record in records:
    title = (record.get("title") or "").lower()

    if not any(word in title for word in technical_keywords):
        continue

    total += 1
    description = record.get("description") or ""
    detected = extract_skills(description)

    counts.update(detected)

    if len(detected) == 0:
        print("\nTitle:", record.get("title"))
        print("Description:", description[:500])

print("\nTechnical jobs checked:", total)
print("\nDetected skills:")

for skill, count in counts.most_common(40):
    print(f"{skill}: {count}")

print("\n============================================")