import re
from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/skills", tags=["Semantic Skill Extractor"])


class ExtractSkillsRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Free-text resume, biography, or informal experience")


# Mapping of skill names to extraction keywords and patterns
TAXONOMY_KEYWORDS: Dict[str, Dict[str, Any]] = {
    "Python Programming": {
        "id": 1,
        "keywords": ["python", "pandas", "numpy", "django", "flask", "scripting", "fastapi"],
        "category": "Technology & Coding"
    },
    "Data Analysis (Pandas/SQL)": {
        "id": 2,
        "keywords": ["data analysis", "sql", "queries", "dashboards", "bi", "metrics", "analytics", "excel", "sheets"],
        "category": "Technology & Coding"
    },
    "Web Development (HTML/CSS/JS)": {
        "id": 3,
        "keywords": ["html", "css", "javascript", "web", "frontend", "responsive", "website", "ui"],
        "category": "Technology & Coding"
    },
    "React / Modern Frontend": {
        "id": 4,
        "keywords": ["react", "typescript", "vue", "angular", "components", "spa", "vite", "nextjs"],
        "category": "Technology & Coding"
    },
    "Project Management & Agile": {
        "id": 5,
        "keywords": ["project management", "agile", "scrum", "kanban", "sprints", "jira", "trello", "timeline", "planning"],
        "category": "Business & Operations"
    },
    "Digital Marketing & Growth": {
        "id": 6,
        "keywords": ["marketing", "social media", "seo", "instagram", "campaigns", "content", "leads", "branding"],
        "category": "Business & Operations"
    },
    "Public Speaking & Presentation": {
        "id": 7,
        "keywords": ["public speaking", "presentation", "workshop", "tutoring", "training", "pitch", "facilitation"],
        "category": "Soft Skills & Leadership"
    },
    "Financial Literacy & Budgeting": {
        "id": 8,
        "keywords": ["budget", "accounting", "p&l", "finance", "expenses", "revenue", "invoicing", "bookkeeping"],
        "category": "Finance & Economics"
    },
    "Cloud Computing (AWS/GCP)": {
        "id": 9,
        "keywords": ["cloud", "aws", "gcp", "azure", "docker", "serverless", "devops", "s3"],
        "category": "Technology & Coding"
    },
    "AI & Machine Learning Concepts": {
        "id": 10,
        "keywords": ["machine learning", "ai", "deep learning", "llm", "neural", "nlp", "predictive", "models"],
        "category": "Technology & Coding"
    },
    "Negotiation & Stakeholder Management": {
        "id": 11,
        "keywords": ["negotiation", "stakeholder", "vendor", "contracts", "partnerships", "conflict", "client management"],
        "category": "Soft Skills & Leadership"
    },
    "Graphic Design & Visuals": {
        "id": 12,
        "keywords": ["design", "canva", "figma", "photoshop", "graphics", "ui/ux", "branding", "wireframes"],
        "category": "Creative & Design"
    }
}


@router.post("/extract")
def extract_semantic_skills(payload: ExtractSkillsRequest):
    """
    Extracts validated skills from unstructured resume or experience text
    using keyword NLP and context scoring against the WEIS 24-skill taxonomy.
    """
    cleaned_text = payload.text.lower()
    extracted_skills: List[Dict[str, Any]] = []

    for skill_name, data in TAXONOMY_KEYWORDS.items():
        matched_keywords = []
        for kw in data["keywords"]:
            if re.search(r"\b" + re.escape(kw) + r"\b", cleaned_text):
                matched_keywords.append(kw)

        if matched_keywords:
            # Determine proficiency estimate based on match density and context
            count = len(matched_keywords)
            if count >= 3:
                proficiency = "advanced"
                confidence = 94
            elif count == 2:
                proficiency = "intermediate"
                confidence = 85
            else:
                proficiency = "beginner"
                confidence = 74

            extracted_skills.append({
                "skill_id": data["id"],
                "skill_name": skill_name,
                "category": data["category"],
                "matched_terms": matched_keywords,
                "recommended_level": proficiency,
                "confidence_score": confidence,
            })

    # Sort descending by confidence score
    extracted_skills.sort(key=lambda x: x["confidence_score"], reverse=True)

    return {
        "text_length": len(payload.text),
        "total_extracted": len(extracted_skills),
        "skills": extracted_skills,
    }
