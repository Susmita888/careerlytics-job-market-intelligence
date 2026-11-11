from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..schemas import ResumeAnalysisOut, ResumeMatchIn, ResumeMatchOut
from ml.resume_analyzer import analyze_resume, match_resume_to_job


from ..config import settings
from ..database import get_db
from ..deps import current_user
from ..models import Resume, User, SkillProgress
from ..schemas import ProfileIn, ProfileOut, ResumeOut
from ml.resume_parser import parse_resume, pdf_to_text


from ..schemas import (
    ProfileIn,
    ProfileOut,
    ResumeOut,
    ResumeAnalysisOut,
    ResumeMatchIn,
    ResumeMatchOut,
    SkillProgressUpdate,
    SkillProgressOut,
)

router = APIRouter(tags=["resume"])


@router.post("/resume/upload", response_model=ResumeOut, status_code=201)
async def upload_resume(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    name = (file.filename or "resume").lower()
    if not name.endswith((".pdf", ".txt")):
        raise HTTPException(415, "Upload a PDF or plain-text (.txt) resume")
    data = await file.read(settings.max_resume_mb * 1024 * 1024 + 1)
    if len(data) > settings.max_resume_mb * 1024 * 1024:
        raise HTTPException(413, f"Resume is larger than {settings.max_resume_mb} MB")
    if name.endswith(".pdf") and not data.startswith(b"%PDF"):
        raise HTTPException(400, "This file does not look like a valid PDF")
    try:
        text = pdf_to_text(data) if name.endswith(".pdf") else data.decode("utf-8", errors="ignore")
    except Exception:
        raise HTTPException(400, "Could not read this PDF. Try exporting it again or upload a .txt version.")
    if len(text.strip()) < 30:
        raise HTTPException(422, "No readable text found. Scanned/image-only PDFs aren't supported.")
    parsed = parse_resume(text)
    resume = Resume(user_id=user.id, filename=(file.filename or "resume")[:255], text=text[:30000], **parsed)
    db.add(resume)
    # merge detected skills into the profile, keeping anything the user added manually
    user.profile.skills = sorted(set(user.profile.skills or []) | set(parsed["skills"]))
    if parsed["experience_years"] and not user.profile.experience_years:
        user.profile.experience_years = parsed["experience_years"]
    if parsed["education"] and not user.profile.education:
        user.profile.education = parsed["education"][0]
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/resume/latest", response_model=ResumeOut | None)
def latest_resume(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()).first()


@router.delete("/resume", status_code=204)
def delete_resumes(user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.query(Resume).filter(Resume.user_id == user.id).delete()
    db.commit()


@router.get("/profile", response_model=ProfileOut)
def get_profile(user: User = Depends(current_user)):
    return user.profile


@router.put("/profile", response_model=ProfileOut)
def update_profile(body: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    from ml.skills_dictionary import SKILLS
    canon = {n.lower(): n for n in SKILLS}
    user.profile.skills = sorted({canon.get(s.strip().lower(), s.strip()) for s in body.skills if s.strip()})
    user.profile.education = body.education
    user.profile.experience_years = body.experience_years
    user.profile.target_role = body.target_role
    user.profile.preferred_location = body.preferred_location
    db.commit()
    return user.profile



@router.get("/resume/analysis", response_model=ResumeAnalysisOut)
def get_resume_analysis(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not resume:
        raise HTTPException(404, "Upload a resume before analyzing it.")

    return analyze_resume(resume.text)


@router.post("/resume/match", response_model=ResumeMatchOut)
def compare_resume_with_job(
    body: ResumeMatchIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not resume:
        raise HTTPException(404, "Upload a resume before matching it.")

    return match_resume_to_job(resume.text, body.job_description)



@router.get(
    "/resume/skill-progress",
    response_model=SkillProgressOut
)
def get_skill_progress(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(SkillProgress)
        .filter(
            SkillProgress.user_id == user.id,
            SkillProgress.completed == True
        )
        .all()
    )

    return {
        "completed_skills": [record.skill for record in records]
    }


@router.put("/resume/skill-progress")
def update_skill_progress(
    body: SkillProgressUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    skill = body.skill.strip()

    if not skill:
        raise HTTPException(422, "Skill name cannot be empty.")

    skill_key = skill.casefold()

    record = (
        db.query(SkillProgress)
        .filter(
            SkillProgress.user_id == user.id,
            SkillProgress.skill_key == skill_key
        )
        .first()
    )

    if record:
        record.completed = body.completed
        record.skill = skill
    else:
        record = SkillProgress(
            user_id=user.id,
            skill=skill,
            skill_key=skill_key,
            completed=body.completed
        )
        db.add(record)

    db.commit()

    return {
        "message": "Skill progress updated successfully.",
        "skill": skill,
        "completed": body.completed
    }