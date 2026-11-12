
"""Hybrid job recommender: Score = 0.5*S + 0.3*T + 0.2*E.

S = skill overlap (share of the job's required skills the user has)
T = TF-IDF cosine similarity between the user's text and each job description
E = sentence-embedding cosine similarity (optional; weights are
renormalised if embeddings are unavailable).

The weights are initial design choices, not validated optima.
Use ml/evaluate.py with hand-labelled profiles to tune them.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


WEIGHTS = {
    "skill": 0.5,
    "tfidf": 0.3,
    "embed": 0.2,
}


def skill_overlap(
    user_skills: list[str],
    job_skills: list[str],
):
    """Calculate skill overlap between a user and a job."""

    user_set = {s.lower() for s in user_skills}

    matched = [
        skill for skill in job_skills
        if skill.lower() in user_set
    ]

    missing = [
        skill for skill in job_skills
        if skill.lower() not in user_set
    ]

    score = (
        len(matched) / len(job_skills)
        if job_skills else 0.0
    )

    return score, matched, missing


class _Embedder:
    _model = None

    @classmethod
    def available(cls, name: str) -> bool:
        try:
            if cls._model is None:
                from sentence_transformers import SentenceTransformer

                cls._model = SentenceTransformer(name)

            return True

        except Exception:
            return False

    @classmethod
    def encode(cls, texts: list[str]) -> np.ndarray:
        return cls._model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
        )


@dataclass
class JobRecord:
    id: int
    skills: list[str]
    text: str


class Recommender:

    def __init__(
        self,
        jobs: list[JobRecord],
        use_embeddings: bool = False,
        model_name: str = "all-MiniLM-L6-v2",
    ):
        self.jobs = jobs

        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_features=30000,
        )

        texts = [job.text for job in jobs] or [""]

        try:
            self.matrix = self.vectorizer.fit_transform(texts)

        except ValueError:
            # Handles empty vocabulary.
            self.matrix = None

        self.embeddings = None

        self.use_embeddings = bool(
            use_embeddings
            and jobs
            and _Embedder.available(model_name)
        )

        if self.use_embeddings:
            self.embeddings = _Embedder.encode(texts)

    # IMPORTANT: score() belongs inside the Recommender class.
    def score(
        self,
        user_skills: list[str],
        user_text: str = "",
        top_k: int | None = None,
    ) -> list[dict]:

        if not self.jobs:
            return []

        query = (
            (user_text or "")
            + " "
            + " ".join(user_skills)
        )

        # 1. TF-IDF similarity
        if self.matrix is not None and query.strip():
            tfidf = cosine_similarity(
                self.vectorizer.transform([query]),
                self.matrix,
            ).ravel()

        else:
            tfidf = np.zeros(len(self.jobs))

        # 2. Optional semantic similarity
        if self.use_embeddings:
            embed = (
                self.embeddings
                @ _Embedder.encode([query])[0]
            ).clip(0, 1)

            w = WEIGHTS

        else:
            embed = np.zeros(len(self.jobs))

            total = WEIGHTS["skill"] + WEIGHTS["tfidf"]

            w = {
                "skill": WEIGHTS["skill"] / total,
                "tfidf": WEIGHTS["tfidf"] / total,
                "embed": 0.0,
            }

        # 3. Skill overlap
        skill_scores = np.zeros(len(self.jobs))
        matched_missing = []

        for i, job in enumerate(self.jobs):

            s, matched, missing = skill_overlap(
                user_skills,
                job.skills,
            )

            skill_scores[i] = s
            matched_missing.append((matched, missing))

        # 4. Calculate final hybrid scores
        final_scores = (
            w["skill"] * skill_scores
            + w["tfidf"] * tfidf
            + w["embed"] * embed
        )

        # 5. Select top candidates for better performance
        if (
            top_k is not None
            and 0 < top_k < len(self.jobs)
        ):
            indices = np.argpartition(
                final_scores,
                -top_k,
            )[-top_k:]

        else:
            indices = np.arange(len(self.jobs))

        # 6. Sort selected candidates by score
        indices = indices[
            np.argsort(final_scores[indices])[::-1]
        ]

        # 7. Build recommendation results
        results = []

        for i in indices:

            matched, missing = matched_missing[i]

            results.append({
                "job_id": self.jobs[i].id,
                "score": round(
                    float(final_scores[i]) * 100, 1
                ),
                "skill_score": round(
                    float(skill_scores[i]) * 100, 1
                ),
                "text_score": round(
                    float(tfidf[i]) * 100, 1
                ),
                "semantic_score": (
                    round(float(embed[i]) * 100, 1)
                    if self.use_embeddings
                    else None
                ),
                "matched_skills": matched,
                "missing_skills": missing,
            })

        return results


def explain(r: dict) -> str:
    """Generate a human-readable explanation for a recommendation."""

    n_matched = len(r["matched_skills"])
    n_missing = len(r["missing_skills"])

    total = n_matched + n_missing

    if total == 0:
        return (
            "No skills were detected in this posting, "
            "so this match is based on text similarity only."
        )

    parts = [
        f"You match {n_matched} of {total} detected skills"
    ]

    if r["matched_skills"]:
        parts.append(
            "(" + ", ".join(r["matched_skills"][:4]) + ")"
        )

    if r["missing_skills"]:
        parts.append(
            "; missing: "
            + ", ".join(r["missing_skills"][:3])
        )

    return " ".join(parts[:2]) + "".join(parts[2:]) + "."
