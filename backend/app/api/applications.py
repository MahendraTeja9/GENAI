from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from ..database import get_db
from ..models.application import Application, ApplicationScore
from ..models.job import Job
from ..models.user import User
from ..schemas.application import (
    ApplicationCreate, ApplicationResponse, ApplicationUpdate, 
    ApplicationListResponse, ApplicationStatsResponse
)
from ..services.scoring_service import ScoringService
from ..utils.file_utils import save_uploaded_file, validate_file_type
from ..utils.resume_parser import parse_resume
from ..utils.email import send_application_confirmation, send_shortlist_notification
from .auth import get_current_user
import logging

router = APIRouter()
scoring_service = ScoringService()
logger = logging.getLogger(__name__)

@router.post("/apply")
async def submit_application(
    job_id: int = Form(...),
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    candidate_phone: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    portfolio_url: Optional[str] = Form(None),
    cover_letter: Optional[str] = Form(None),
    additional_info: Optional[str] = Form(None),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Submit a job application (public endpoint)"""
    try:
        # Validate job exists and is published
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.status == "published",
            Job.is_active == True
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found or not available for applications"
            )
        
        # Validate file type
        if not validate_file_type(resume):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload PDF or DOCX files only."
            )
        
        # Save resume file
        filename, filepath = await save_uploaded_file(resume)
        
        # Generate reference number
        reference_number = f"REF-{str(uuid.uuid4())[:8].upper()}"
        
        # Create application
        application = Application(
            reference_number=reference_number,
            full_name=candidate_name,
            email=candidate_email,
            phone=candidate_phone,
            linkedin_url=linkedin_url,
            github_url=github_url,
            portfolio_url=portfolio_url,
            cover_letter=cover_letter,
            additional_info=additional_info,
            resume_filename=filename,
            resume_path=filepath,
            job_id=job_id,
            status="pending"
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        # Parse resume in background
        try:
            parsed_data = parse_resume(filepath, filename)
            
            # Update application with parsed data
            application.parsed_skills = parsed_data.get('parsed_skills', [])
            application.parsed_experience = parsed_data.get('parsed_experience', [])
            application.parsed_education = parsed_data.get('parsed_education', [])
            application.parsed_certifications = parsed_data.get('parsed_certifications', [])
            
            db.commit()
            
            # Score the application
            await scoring_service.score_application(db, application)
            
        except Exception as e:
            logger.error(f"Error processing resume for application {application.id}: {e}")
        
        # Send confirmation email
        try:
            send_application_confirmation(
                application.email,
                application.full_name,
                job.title,
                application.reference_number
            )
        except Exception as e:
            logger.error(f"Error sending confirmation email: {e}")
        
        return {
            "id": application.id,
            "reference_number": application.reference_number,
            "message": "Application submitted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error submitting application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing application"
        )

@router.get("/")
async def get_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    job_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get applications (HR and Admin only)"""
    try:
        if current_user.user_type not in ["hr", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR and Admin can view applications"
            )
        
        query = db.query(Application).join(Job)
        
        # Filter by company for non-admin users
        if current_user.user_type != "admin":
            query = query.filter(Job.company_id == current_user.company_id)
        
        # Apply filters - handle empty strings
        if job_id and job_id > 0:
            query = query.filter(Application.job_id == job_id)
        if status and status.strip():
            query = query.filter(Application.status == status)
        
        # Apply sorting (default to created_at)
        sort_field = sort or "created_at"
        sort_order = order or "desc"
        
        if sort_field == "created_at":
            if sort_order == "desc":
                query = query.order_by(Application.created_at.desc())
            else:
                query = query.order_by(Application.created_at.asc())
        elif sort_field == "candidate_name":
            if sort_order == "desc":
                query = query.order_by(Application.full_name.desc())
            else:
                query = query.order_by(Application.full_name.asc())
        else:
            # Default fallback
            query = query.order_by(Application.created_at.desc())
        
        applications = query.offset(skip).limit(limit).all()
        
        # Transform to include job title and scores
        result = []
        for app in applications:
            app_dict = {
                "id": app.id,
                "reference_number": app.reference_number,
                "candidate_name": app.full_name,
                "candidate_email": app.email,
                "candidate_phone": app.phone,
                "job_title": app.job.title if app.job else "Unknown",
                "job_id": app.job_id,
                "status": app.status,
                "cover_letter": app.cover_letter,
                "additional_info": app.additional_info,
                "resume_filename": app.resume_filename,
                "resume_url": f"/api/files/{app.resume_filename}" if app.resume_filename else None,
                "created_at": app.created_at,
                "updated_at": app.updated_at,
                "processed_at": getattr(app, 'processed_at', None),
                "ai_score": None,
                "match_score": None,
                "ats_score": None,
                "ai_summary": None,
                "skills_match": []
            }
            
            # Get scores if available
            scores = db.query(ApplicationScore).filter(ApplicationScore.application_id == app.id).first()
            if scores:
                app_dict.update({
                    "ai_score": scores.final_score,
                    "match_score": scores.match_score,
                    "ats_score": scores.ats_score,
                    "ai_summary": scores.ai_feedback
                })
            
            result.append(app_dict)
    
        return result
    
    except Exception as e:
        logger.error(f"Error getting applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading applications: {str(e)}"
        )

@router.get("/stats", response_model=ApplicationStatsResponse)
async def get_application_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application statistics"""
    if current_user.user_type not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin can view statistics"
        )
    
    query = db.query(Application).join(Job)
    
    # Filter by company for non-admin users
    if current_user.user_type != "admin":
        query = query.filter(Job.company_id == current_user.company_id)
    
    # Get basic stats
    total_applications = query.count()
    shortlisted = query.filter(Application.status == "shortlisted").count()
    rejected = query.filter(Application.status == "rejected").count()
    under_review = query.filter(Application.status == "under_review").count()
    
    # Stats by job
    job_stats = {}
    jobs_query = db.query(Job)
    if current_user.user_type != "admin":
        jobs_query = jobs_query.filter(Job.company_id == current_user.company_id)
    
    for job in jobs_query.all():
        app_count = db.query(Application).filter(Application.job_id == job.id).count()
        job_stats[job.title] = app_count
    
    # Stats by status
    status_stats = {
        "submitted": query.filter(Application.status == "submitted").count(),
        "under_review": under_review,
        "shortlisted": shortlisted,
        "rejected": rejected
    }
    
    return ApplicationStatsResponse(
        total_applications=total_applications,
        shortlisted_candidates=shortlisted,
        rejected_candidates=rejected,
        under_review=under_review,
        by_job=job_stats,
        by_status=status_stats
    )

@router.get("/{application_id}")
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific application"""
    application = db.query(Application).join(Job).filter(
        Application.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.user_type not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin can view applications"
        )
    
    if current_user.user_type != "admin" and application.job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Transform to expected format
    app_dict = {
        "id": application.id,
        "reference_number": application.reference_number,
        "candidate_name": application.full_name,
        "candidate_email": application.email,
        "candidate_phone": application.phone,
        "job_title": application.job.title if application.job else "Unknown",
        "job_id": application.job_id,
        "status": application.status,
        "cover_letter": application.cover_letter,
        "additional_info": application.additional_info,
        "resume_filename": application.resume_filename,
        "resume_url": f"/api/files/{application.resume_filename}" if application.resume_filename else None,
        "resume_text": None,  # Would need to parse if needed
        "created_at": application.created_at,
        "updated_at": application.updated_at,
        "processed_at": getattr(application, 'processed_at', None),
        "ai_score": None,
        "match_score": None,
        "ats_score": None,
        "ai_summary": None,
        "skills_match": []
    }
    
    # Get scores if available
    scores = db.query(ApplicationScore).filter(ApplicationScore.application_id == application.id).first()
    if scores:
        app_dict.update({
            "ai_score": scores.final_score,
            "match_score": scores.match_score,
            "ats_score": scores.ats_score,
            "ai_summary": scores.ai_feedback
        })
    
    return app_dict

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    update_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application status"""
    if current_user.user_type not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin can update applications"
        )
    
    application = db.query(Application).join(Job).filter(
        Application.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.user_type != "admin" and application.job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update fields
    update_fields = update_data.dict(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    
    # Send notification if shortlisted
    if update_data.status == "shortlisted":
        try:
            send_shortlist_notification(
                application.email,
                application.full_name,
                application.job.title
            )
        except Exception as e:
            logger.error(f"Error sending shortlist notification: {e}")
    
    return ApplicationResponse.from_orm(application)

@router.patch("/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application status"""
    if current_user.user_type not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin can update application status"
        )
    
    application = db.query(Application).join(Job).filter(
        Application.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.user_type != "admin" and application.job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update status
    new_status = status_data.get("status")
    if new_status:
        application.status = new_status
        db.commit()
        db.refresh(application)
        
        # Send notification if shortlisted
        if new_status == "shortlisted":
            try:
                send_shortlist_notification(
                    application.email,
                    application.full_name,
                    application.job.title
                )
            except Exception as e:
                logger.error(f"Error sending shortlist notification: {e}")
    
    return {"message": "Status updated successfully", "status": application.status}

@router.post("/{application_id}/rescore")
async def rescore_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rescore an application"""
    if current_user.user_type not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin can rescore applications"
        )
    
    application = db.query(Application).join(Job).filter(
        Application.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.user_type != "admin" and application.job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    try:
        # Rescore the application
        score = await scoring_service.score_application(db, application)
        return {"message": "Application rescored successfully", "score": score.final_score}
    except Exception as e:
        logger.error(f"Error rescoring application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error rescoring application"
        )

@router.get("/reference/{reference_number}")
async def get_application_by_reference(
    reference_number: str,
    db: Session = Depends(get_db)
):
    """Get application by reference number (public endpoint for candidates)"""
    application = db.query(Application).filter(
        Application.reference_number == reference_number
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Return limited information for public access
    app_dict = {
        "id": application.id,
        "reference_number": application.reference_number,
        "candidate_name": application.full_name,
        "candidate_email": application.email,
        "job_title": application.job.title if application.job else "Unknown",
        "job_id": application.job_id,
        "status": application.status,
        "created_at": application.created_at,
        "updated_at": application.updated_at,
        "processed_at": getattr(application, 'processed_at', None),
        "ai_score": None,
        "match_score": None,
        "ats_score": None,
        "ai_summary": None
    }
    
    # Get scores if available
    scores = db.query(ApplicationScore).filter(ApplicationScore.application_id == application.id).first()
    if scores:
        app_dict.update({
            "ai_score": scores.final_score,
            "match_score": scores.match_score,
            "ats_score": scores.ats_score,
            "ai_summary": scores.ai_feedback
        })
    
    return app_dict
