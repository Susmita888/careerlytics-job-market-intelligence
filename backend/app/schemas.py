from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=120)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str


class ProfileIn(BaseModel):
    skills: list[str] = Field(default_factory=list, max_length=100)
    education: str = ""
    experience_years: float = Field(default=0, ge=0, le=50)
    target_role: str = ""
    preferred_location: str = ""


class ProfileOut(ProfileIn):
    pass


class JobOut(BaseModel):
    id: int
    title: str
    role_family: str
    company: str
    location: str
    job_type: str
    experience_level: str
    salary_min: float | None
    salary_max: float | None
    posted_date: date | None
    url: str
    source: str
    skills: list[str]
    saved: bool = False


class JobDetail(JobOut):
    description: str


class JobPage(BaseModel):
    items: list[JobOut]
    total: int
    page: int
    page_size: int


class Recommendation(BaseModel):
    job: JobOut
    score: float
    skill_score: float
    text_score: float
    semantic_score: float | None
    matched_skills: list[str]
    missing_skills: list[str]
    explanation: str


class ResumeOut(BaseModel):
    id: int
    filename: str
    skills: list[str]
    education: list[str]
    experience_years: float
    uploaded_at: datetime


class GapItem(BaseModel):
    skill: str
    jobs_requiring: int
    share_of_top_matches: float
    reason: str


class GapOut(BaseModel):
    user_skills: list[str]
    top_matches_considered: int
    average_match_score: float
    priorities: list[GapItem]



class RoleOption(BaseModel):
    value: str
    label: str
    job_count: int


class RoleGapCompareIn(BaseModel):
    roles: list[str] = Field(min_length=2, max_length=5)


class RoleGapItem(BaseModel):
    skill: str
    jobs_requiring: int
    share_of_role_jobs: float


class RoleGapResult(BaseModel):
    role: str
    total_jobs: int
    jobs_with_skills: int
    existing_skills: list[str]
    missing_skills: list[RoleGapItem]


class RoleGapCompareOut(BaseModel):
    user_skills: list[str]
    roles: list[RoleGapResult]
    common_missing_skills: list[str]



class ResumeAnalysisOut(BaseModel):
    ats_score: int
    word_count: int
    sections_found: list[str]
    skills: list[str]
    suggestions: list[str]


class ResumeMatchIn(BaseModel):
    job_description: str = Field(min_length=30, max_length=20000)


class ResumeMatchOut(BaseModel):
    match_percentage: float
    matched_skills: list[str]
    missing_skills: list[str]
    required_skills: list[str]
    suggestions: list[str]


class SkillProgressUpdate(BaseModel):
    skill: str = Field(min_length=1, max_length=100)
    completed: bool


class SkillProgressOut(BaseModel):
    completed_skills: list[str]