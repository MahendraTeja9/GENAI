#!/usr/bin/env python3
"""
Create a sample published job for testing the careers page
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.job import Job
from app.models.user import User
from datetime import datetime

def create_sample_job():
    """Create a sample published job"""
    
    db = SessionLocal()
    
    try:
        # Check if a published job already exists
        existing_job = db.query(Job).filter(Job.status == "published").first()
        if existing_job:
            print("Sample job already exists.")
            return
        
        # Get the account manager user
        account_manager = db.query(User).filter(User.user_type == "account_manager").first()
        hr_user = db.query(User).filter(User.user_type == "hr").first()
        
        if not account_manager or not hr_user:
            print("Required users not found. Please run init_db.py first.")
            return
        
        # Create sample job
        sample_job = Job(
            title="Senior Frontend Developer",
            description="""
We are seeking a talented Senior Frontend Developer to join our dynamic team at TechCorp Solutions. You will be responsible for building cutting-edge web applications using modern technologies.

**Key Responsibilities:**
• Develop responsive web applications using React, TypeScript, and modern CSS frameworks
• Collaborate with designers and backend developers to implement user-friendly interfaces
• Optimize applications for maximum speed and scalability
• Mentor junior developers and contribute to code reviews
• Stay up-to-date with the latest frontend technologies and best practices

**Requirements:**
• 5+ years of experience in frontend development
• Expert knowledge of React, JavaScript, and TypeScript
• Experience with modern CSS frameworks (Tailwind CSS, Styled Components)
• Familiarity with state management libraries (Redux, Zustand)
• Understanding of RESTful APIs and GraphQL
• Experience with testing frameworks (Jest, Cypress)
• Strong problem-solving skills and attention to detail

**Nice to Have:**
• Experience with Next.js or other React frameworks
• Knowledge of backend technologies (Node.js, Python)
• Familiarity with cloud platforms (AWS, Azure, GCP)
• Experience with CI/CD pipelines

**What We Offer:**
• Competitive salary package ($100,000 - $140,000)
• Comprehensive health, dental, and vision insurance
• Flexible working hours and remote work options
• Professional development opportunities
• Modern office space in the heart of San Francisco
• Generous PTO and company holidays
• Stock options and performance bonuses
            """,
            short_description="Join our team as a Senior Frontend Developer and help build the next generation of web applications using React, TypeScript, and modern technologies.",
            department="Engineering",
            location="San Francisco, CA (Hybrid)",
            job_type="full-time",
            experience_level="senior",
            salary_range="$100,000 - $140,000",
            key_skills=[
                "React", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
                "Redux", "REST APIs", "Git", "Jest", "Responsive Design"
            ],
            required_experience="5+ years of frontend development experience with React and TypeScript",
            certifications=["AWS Certified Developer (preferred)", "React certification (preferred)"],
            additional_requirements=[
                "Strong communication skills",
                "Ability to work in an Agile environment",
                "Experience with code reviews and mentoring",
                "Portfolio of previous work"
            ],
            status="published",
            is_active=True,
            company_id=account_manager.company_id,
            created_by=account_manager.id,
            approved_by=hr_user.id,
            approved_at=datetime.utcnow(),
            published_at=datetime.utcnow()
        )
        
        db.add(sample_job)
        db.commit()
        db.refresh(sample_job)
        
        print("✅ Sample job created successfully!")
        print(f"   Job ID: {sample_job.id}")
        print(f"   Title: {sample_job.title}")
        print(f"   Status: {sample_job.status}")
        print("\nYou can now visit http://localhost:3000/careers to see the job listing!")
        
    except Exception as e:
        print(f"❌ Error creating sample job: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_job()
