#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.application import Application, ApplicationScore
from app.models.job import Job
import uuid
from datetime import datetime

def create_test_applications():
    db = SessionLocal()
    
    try:
        # Get published jobs
        published_jobs = db.query(Job).filter(
            Job.status == "published",
            Job.is_active == True
        ).all()
        
        if not published_jobs:
            print("No published jobs found. Creating test applications for any job...")
            jobs = db.query(Job).filter(Job.is_active == True).all()
            if not jobs:
                print("No jobs found at all!")
                return
            published_jobs = jobs[:1]  # Take first job
        
        # Create test applications
        test_applications = [
            {
                "full_name": "John Smith",
                "email": "john.smith@email.com",
                "phone": "+1-555-0101",
                "cover_letter": "I am very interested in this position and believe my skills align well with your requirements.",
                "status": "pending"
            },
            {
                "full_name": "Sarah Johnson",
                "email": "sarah.johnson@email.com",
                "phone": "+1-555-0102",
                "cover_letter": "With 5 years of experience in this field, I am excited to contribute to your team.",
                "status": "shortlisted"
            },
            {
                "full_name": "Mike Davis",
                "email": "mike.davis@email.com",
                "phone": "+1-555-0103",
                "cover_letter": "I have been following your company and would love to be part of your innovative team.",
                "status": "interview_scheduled"
            }
        ]
        
        for i, app_data in enumerate(test_applications):
            job = published_jobs[i % len(published_jobs)]
            
            # Generate reference number
            reference_number = f"APP-{str(uuid.uuid4())[:8].upper()}"
            
            application = Application(
                reference_number=reference_number,
                full_name=app_data["full_name"],
                email=app_data["email"],
                phone=app_data["phone"],
                resume_filename=f"resume_{app_data['full_name'].lower().replace(' ', '_')}.pdf",
                resume_path=f"/tmp/resumes/resume_{app_data['full_name'].lower().replace(' ', '_')}.pdf",
                cover_letter=app_data["cover_letter"],
                job_id=job.id,
                status=app_data["status"],
                created_at=datetime.utcnow()
            )
            
            db.add(application)
            db.commit()
            db.refresh(application)
            
            # Create test scores
            score = ApplicationScore(
                application_id=application.id,
                match_score=75.0 + (i * 10),  # 75, 85, 95
                ats_score=80.0 + (i * 5),     # 80, 85, 90
                final_score=77.5 + (i * 7.5), # 77.5, 85, 92.5
                ai_feedback=f"Good candidate with relevant experience. Shows strong {['technical', 'leadership', 'communication'][i]} skills."
            )
            
            db.add(score)
            db.commit()
            
            print(f"Created application: {application.full_name} -> {job.title} (Ref: {reference_number})")
        
        print(f"\nSuccessfully created {len(test_applications)} test applications!")
        
    except Exception as e:
        print(f"Error creating test applications: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_applications()
