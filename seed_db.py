"""
WEIS Database Seeding Script.
Populates standard initial data:
- Master Skills catalog
- Master Courses catalog (linked to skills)
- Standard Demo Users (Mentee, Mentors, Admin)
- Initial Verified Mentor Profiles
- Sample Assessment & Recommendations for quick demo
Usage:
    python seed_db.py [--db sqlite|mysql]
"""

import sys
import argparse
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app.models import (
    User,
    RoleEnum,
    Skill,
    UserSkill,
    ProficiencyEnum,
    Course,
    Mentor,
    SkillGapAssessment,
    AssessmentGapDetail,
    Recommendation,
    RecommendationStatusEnum,
    SafetyReport,
    SafetyStatusEnum,
    MentorshipRequest,
    MentorshipStatusEnum,
)
from app.security import hash_password


def seed_database(db: Session):
    print("🌱 Starting WEIS database seeding...")

    # 1. Seed Skills Catalog
    skills_data = [
        {"skill_name": "Python Programming", "category": "Technical"},
        {"skill_name": "Data Analysis (Pandas/SQL)", "category": "Technical"},
        {"skill_name": "Communication & Presentation", "category": "Soft Skills"},
        {"skill_name": "Project Management (Agile)", "category": "Management"},
        {"skill_name": "Machine Learning Basics", "category": "Technical"},
        {"skill_name": "Financial Literacy", "category": "Finance"},
        {"skill_name": "Digital Marketing & SEO", "category": "Marketing"},
        {"skill_name": "UI/UX Design Thinking", "category": "Design"},
        {"skill_name": "Cloud Computing (AWS/GCP)", "category": "Technical"},
        {"skill_name": "Web Development (HTML/CSS/JS)", "category": "Technical"},
    ]

    skill_records = {}
    for s_data in skills_data:
        existing = db.query(Skill).filter(Skill.skill_name == s_data["skill_name"]).first()
        if not existing:
            new_skill = Skill(**s_data)
            db.add(new_skill)
            db.flush()
            skill_records[s_data["skill_name"]] = new_skill
        else:
            skill_records[s_data["skill_name"]] = existing

    db.commit()
    print(f"✓ Skills catalog seeded ({len(skill_records)} skills).")

    # 2. Seed Courses Catalog
    courses_data = [
        {
            "title": "Python for Everybody Specialization",
            "provider": "Coursera / Univ. of Michigan",
            "skill_name": "Python Programming",
            "url": "https://www.coursera.org/specializations/python",
            "duration_hours": 30,
        },
        {
            "title": "Google Data Analytics Professional Certificate",
            "provider": "Coursera / Google",
            "skill_name": "Data Analysis (Pandas/SQL)",
            "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
            "duration_hours": 40,
        },
        {
            "title": "Effective Communication in the Workplace",
            "provider": "edX / Harvard",
            "skill_name": "Communication & Presentation",
            "url": "https://www.edx.org/course/effective-communication",
            "duration_hours": 15,
        },
        {
            "title": "Agile Project Management with Jira",
            "provider": "Coursera / Atlassian",
            "skill_name": "Project Management (Agile)",
            "url": "https://www.coursera.org/learn/agile-atlassian-jira",
            "duration_hours": 20,
        },
        {
            "title": "Intro to Machine Learning with PyTorch",
            "provider": "Udacity",
            "skill_name": "Machine Learning Basics",
            "url": "https://www.udacity.com/course/deep-learning-nanodegree--nd101",
            "duration_hours": 35,
        },
        {
            "title": "Financial Planning & Literacy Foundations",
            "provider": "Khan Academy",
            "skill_name": "Financial Literacy",
            "url": "https://www.khanacademy.org/college-careers-more/personal-finance",
            "duration_hours": 12,
        },
        {
            "title": "Digital Marketing Specialization",
            "provider": "Coursera / Univ. of Illinois",
            "skill_name": "Digital Marketing & SEO",
            "url": "https://www.coursera.org/specializations/digital-marketing",
            "duration_hours": 25,
        },
        {
            "title": "Google UX Design Professional Certificate",
            "provider": "Coursera / Google",
            "skill_name": "UI/UX Design Thinking",
            "url": "https://www.coursera.org/professional-certificates/google-ux-design",
            "duration_hours": 40,
        },
        {
            "title": "AWS Certified Cloud Practitioner Essentials",
            "provider": "AWS Training",
            "skill_name": "Cloud Computing (AWS/GCP)",
            "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
            "duration_hours": 20,
        },
        {
            "title": "Full-Stack Web Development Bootcamp",
            "provider": "freeCodeCamp",
            "skill_name": "Web Development (HTML/CSS/JS)",
            "url": "https://www.freecodecamp.org/",
            "duration_hours": 60,
        },
    ]

    for c_data in courses_data:
        skill_name = c_data.pop("skill_name")
        skill = skill_records.get(skill_name)
        existing = db.query(Course).filter(Course.title == c_data["title"]).first()
        if not existing:
            new_course = Course(**c_data, skill_id=skill.skill_id if skill else None)
            db.add(new_course)

    db.commit()
    print("✓ Courses catalog seeded.")

    # 3. Seed Standard Demo Users
    users_data = [
        {
            "email": "mentee@weis.org",
            "full_name": "Amina Rao",
            "password_hash": hash_password("password123"),
            "role": RoleEnum.mentee,
            "phone": "+91 98765 43210",
            "location": "Bengaluru, India",
        },
        {
            "email": "amina@example.com",
            "full_name": "Amina Rao",
            "password_hash": hash_password("password123"),
            "role": RoleEnum.mentee,
            "phone": "+91 98765 43210",
            "location": "Bengaluru, India",
        },
        {
            "email": "mentor@weis.org",
            "full_name": "Dr. Sunita Sharma",
            "password_hash": hash_password("password123"),
            "role": RoleEnum.mentor,
            "phone": "+91 98111 22334",
            "location": "Mumbai, India",
        },
        {
            "email": "sunita.sharma@example.com",
            "full_name": "Dr. Sunita Sharma",
            "password_hash": hash_password("password123"),
            "role": RoleEnum.mentor,
            "phone": "+91 98111 22334",
            "location": "Mumbai, India",
        },
        {
            "email": "priya@weis.org",
            "full_name": "Priya Iyer",
            "password_hash": hash_password("password123"),
            "role": RoleEnum.mentor,
            "phone": "+91 97222 33445",
            "location": "Hyderabad, India",
        },
        {
            "email": "admin@weis.org",
            "full_name": "WEIS Administrator",
            "password_hash": hash_password("admin123"),
            "role": RoleEnum.admin,
            "phone": "+91 99999 00000",
            "location": "New Delhi, India",
        },
    ]

    user_records = {}
    for u_data in users_data:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            new_user = User(**u_data)
            db.add(new_user)
            db.flush()
            user_records[u_data["email"]] = new_user
        else:
            user_records[u_data["email"]] = existing

    db.commit()
    print("✓ Demo users seeded (mentee@weis.org, mentor@weis.org, priya@weis.org, admin@weis.org).")

    # 4. Seed Mentor Profiles (Verified)
    mentors_info = [
        {
            "user": user_records["mentor@weis.org"],
            "expertise_area": "Data Science & Career Guidance",
            "bio": "Senior Director of AI at Tech Corp. 15+ years mentoring women transitioning into data science and leadership roles.",
            "is_verified": True,
        },
        {
            "user": user_records["priya@weis.org"],
            "expertise_area": "Software Engineering & Cloud Architecture",
            "bio": "Principal Cloud Architect. Passionate about helping early-career female engineers master distributed systems.",
            "is_verified": True,
        },
    ]

    mentor_records = []
    for m_info in mentors_info:
        user = m_info["user"]
        existing = db.query(Mentor).filter(Mentor.user_id == user.user_id).first()
        if not existing:
            m = Mentor(
                user_id=user.user_id,
                expertise_area=m_info["expertise_area"],
                bio=m_info["bio"],
                is_verified=m_info["is_verified"],
            )
            db.add(m)
            db.flush()
            mentor_records.append(m)
        else:
            mentor_records.append(existing)

    db.commit()
    print("✓ Mentor profiles created & verified.")

    # 5. Seed Initial User Skills for Demo Mentee
    mentee = user_records["mentee@weis.org"]
    initial_user_skills = [
        {"skill_name": "Python Programming", "proficiency": ProficiencyEnum.intermediate},
        {"skill_name": "Data Analysis (Pandas/SQL)", "proficiency": ProficiencyEnum.beginner},
        {"skill_name": "Communication & Presentation", "proficiency": ProficiencyEnum.intermediate},
    ]

    for us_data in initial_user_skills:
        skill = skill_records.get(us_data["skill_name"])
        if skill:
            existing = (
                db.query(UserSkill)
                .filter(UserSkill.user_id == mentee.user_id, UserSkill.skill_id == skill.skill_id)
                .first()
            )
            if not existing:
                db.add(
                    UserSkill(
                        user_id=mentee.user_id,
                        skill_id=skill.skill_id,
                        proficiency_level=us_data["proficiency"],
                    )
                )

    db.commit()
    print("✓ Mentee initial skill inventory populated.")

    # 6. Seed a Demo Assessment for Mentee (Target Role: Junior Data Analyst)
    existing_assessment = (
        db.query(SkillGapAssessment)
        .filter(SkillGapAssessment.user_id == mentee.user_id)
        .first()
    )

    if not existing_assessment:
        assessment = SkillGapAssessment(
            user_id=mentee.user_id,
            target_role="Junior Data Analyst",
            overall_score=75.0,
        )
        db.add(assessment)
        db.flush()

        # Add gap details
        python_skill = skill_records["Python Programming"]
        data_skill = skill_records["Data Analysis (Pandas/SQL)"]
        comm_skill = skill_records["Communication & Presentation"]

        details = [
            AssessmentGapDetail(
                assessment_id=assessment.assessment_id,
                skill_id=python_skill.skill_id,
                required_level=ProficiencyEnum.advanced,
                current_level=ProficiencyEnum.intermediate,
                gap_score=33.33,
            ),
            AssessmentGapDetail(
                assessment_id=assessment.assessment_id,
                skill_id=data_skill.skill_id,
                required_level=ProficiencyEnum.advanced,
                current_level=ProficiencyEnum.beginner,
                gap_score=66.67,
            ),
            AssessmentGapDetail(
                assessment_id=assessment.assessment_id,
                skill_id=comm_skill.skill_id,
                required_level=ProficiencyEnum.intermediate,
                current_level=ProficiencyEnum.intermediate,
                gap_score=0.0,
            ),
        ]
        db.add_all(details)
        db.flush()

        # Add recommendations linked to the gaps
        python_course = db.query(Course).filter(Course.skill_id == python_skill.skill_id).first()
        data_course = db.query(Course).filter(Course.skill_id == data_skill.skill_id).first()

        if data_course:
            db.add(
                Recommendation(
                    user_id=mentee.user_id,
                    course_id=data_course.course_id,
                    match_score=66.67,
                    status=RecommendationStatusEnum.pending,
                )
            )
        if python_course:
            db.add(
                Recommendation(
                    user_id=mentee.user_id,
                    course_id=python_course.course_id,
                    match_score=33.33,
                    status=RecommendationStatusEnum.enrolled,
                )
            )

        db.commit()
        print("✓ Demo assessment & recommendations seeded.")

    # 7. Seed Demo Mentorship Request
    if mentor_records:
        existing_req = (
            db.query(MentorshipRequest)
            .filter(
                MentorshipRequest.mentee_id == mentee.user_id,
                MentorshipRequest.mentor_id == mentor_records[0].mentor_id,
            )
            .first()
        )
        if not existing_req:
            db.add(
                MentorshipRequest(
                    mentee_id=mentee.user_id,
                    mentor_id=mentor_records[0].mentor_id,
                    status=MentorshipStatusEnum.pending,
                )
            )
            db.commit()
            print("✓ Sample mentorship request seeded.")

    # 8. Seed Demo Safety Report
    existing_report = (
        db.query(SafetyReport)
        .filter(SafetyReport.user_id == mentee.user_id)
        .first()
    )
    if not existing_report:
        db.add(
            SafetyReport(
                user_id=mentee.user_id,
                incident_type="inappropriate_behavior",
                description="Received an unsolicited promotional message during a webinar chat. Reporting for platform record.",
                status=SafetyStatusEnum.submitted,
            )
        )
        db.commit()
        print("✓ Sample safety report seeded.")

    print("\n🎉 WEIS Database Seeding Complete!")
    print("Demo Logins:")
    print("  • Mentee:  mentee@weis.org  / password123")
    print("  • Mentor:  mentor@weis.org  / password123")
    print("  • Mentor2: priya@weis.org   / password123")
    print("  • Admin:   admin@weis.org   / admin123")


def main():
    parser = argparse.ArgumentParser(description="Seed the WEIS database.")
    parser.add_argument(
        "--sqlite-file",
        type=str,
        default=None,
        help="Seed a local SQLite database file (e.g. weis_dev.db)",
    )
    args = parser.parse_args()

    if args.sqlite_file:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker

        sqlite_engine = create_engine(f"sqlite:///{args.sqlite_file}")
        Base.metadata.create_all(bind=sqlite_engine)
        SessionClass = sessionmaker(bind=sqlite_engine)
        session = SessionClass()
        try:
            seed_database(session)
        finally:
            session.close()
    else:
        # Default configured engine (MySQL or configured DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        session = SessionLocal()
        try:
            seed_database(session)
        finally:
            session.close()


if __name__ == "__main__":
    main()
