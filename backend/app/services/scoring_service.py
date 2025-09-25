from typing import Dict, List, Any, Tuple
from sqlalchemy.orm import Session
from ..models.job import Job, JobRequirement
from ..models.application import Application, ApplicationScore
from ..config import settings
import logging

logger = logging.getLogger(__name__)

class ScoringService:
    def __init__(self):
        self.match_weight = settings.match_score_weight
        self.ats_weight = settings.ats_score_weight
        self.shortlist_threshold = settings.shortlist_threshold
        self.requalify_threshold = settings.requalify_threshold
    
    def calculate_match_score(self, job: Job, application: Application) -> Dict[str, float]:
        """Calculate job-candidate match score"""
        scores = {
            'skills_match': 0.0,
            'experience_match': 0.0,
            'education_match': 0.0,
            'certification_match': 0.0
        }
        
        # Skills matching
        if job.key_skills and application.parsed_skills:
            job_skills = [skill.lower() for skill in job.key_skills]
            candidate_skills = [skill.lower() for skill in application.parsed_skills]
            
            matched_skills = set(job_skills) & set(candidate_skills)
            if job_skills:
                scores['skills_match'] = (len(matched_skills) / len(job_skills)) * 100
        
        # Experience matching (simplified - can be enhanced)
        if application.parsed_experience:
            if len(application.parsed_experience) >= 2:
                scores['experience_match'] = 80.0
            elif len(application.parsed_experience) >= 1:
                scores['experience_match'] = 60.0
            else:
                scores['experience_match'] = 20.0
        
        # Education matching
        if application.parsed_education:
            if any('bachelor' in edu.get('degree', '').lower() for edu in application.parsed_education):
                scores['education_match'] = 70.0
            elif any('master' in edu.get('degree', '').lower() for edu in application.parsed_education):
                scores['education_match'] = 90.0
            else:
                scores['education_match'] = 50.0
        
        # Certification matching
        if job.certifications and application.parsed_certifications:
            job_certs = [cert.lower() for cert in job.certifications]
            candidate_certs = [cert.lower() for cert in application.parsed_certifications]
            
            matched_certs = set(job_certs) & set(candidate_certs)
            if job_certs:
                scores['certification_match'] = (len(matched_certs) / len(job_certs)) * 100
        
        return scores
    
    def calculate_ats_score_breakdown(self, parsed_data: Dict[str, Any], filename: str) -> Dict[str, float]:
        """Calculate detailed ATS score breakdown"""
        scores = {
            'ats_format_score': 0.0,
            'ats_keywords_score': 0.0,
            'ats_structure_score': 0.0
        }
        
        # Format score
        if filename.lower().endswith(('.pdf', '.docx')):
            scores['ats_format_score'] = 100.0
        else:
            scores['ats_format_score'] = 30.0
        
        # Keywords score (based on extracted skills)
        if parsed_data.get('parsed_skills'):
            skill_count = len(parsed_data['parsed_skills'])
            scores['ats_keywords_score'] = min(skill_count * 10, 100.0)
        
        # Structure score (based on sections found)
        structure_score = 0.0
        if parsed_data.get('parsed_experience'):
            structure_score += 40.0
        if parsed_data.get('parsed_education'):
            structure_score += 30.0
        if parsed_data.get('parsed_skills'):
            structure_score += 30.0
        
        scores['ats_structure_score'] = structure_score
        
        return scores
    
    def calculate_final_score(self, match_scores: Dict[str, float], ats_scores: Dict[str, float]) -> float:
        """Calculate final weighted score"""
        # Calculate average match score
        match_values = [score for score in match_scores.values() if score > 0]
        avg_match_score = sum(match_values) / len(match_values) if match_values else 0.0
        
        # Calculate average ATS score
        ats_values = list(ats_scores.values())
        avg_ats_score = sum(ats_values) / len(ats_values) if ats_values else 0.0
        
        # Weighted final score
        final_score = (avg_match_score * self.match_weight) + (avg_ats_score * self.ats_weight)
        return round(final_score, 2)
    
    def determine_candidate_status(self, final_score: float) -> Tuple[str, str]:
        """Determine candidate status based on score"""
        if final_score >= self.shortlist_threshold:
            return "shortlisted", "shortlisted"
        elif final_score >= self.requalify_threshold:
            return "requalification_needed", "under_review"
        else:
            return "rejected", "rejected"
    
    def generate_ai_feedback(self, job: Job, application: Application, scores: Dict[str, float]) -> str:
        """Generate AI feedback for the candidate"""
        feedback_parts = []
        
        # Skills feedback
        if scores.get('skills_match', 0) >= 70:
            feedback_parts.append("Strong skill match with job requirements.")
        elif scores.get('skills_match', 0) >= 40:
            feedback_parts.append("Good skill alignment with some areas for improvement.")
        else:
            feedback_parts.append("Limited skill match with job requirements.")
        
        # Experience feedback
        if scores.get('experience_match', 0) >= 70:
            feedback_parts.append("Relevant work experience aligns well with the role.")
        elif scores.get('experience_match', 0) >= 40:
            feedback_parts.append("Some relevant experience, but could benefit from more exposure.")
        else:
            feedback_parts.append("Limited relevant work experience for this role.")
        
        # ATS feedback
        avg_ats = (scores.get('ats_format_score', 0) + scores.get('ats_keywords_score', 0) + scores.get('ats_structure_score', 0)) / 3
        if avg_ats >= 70:
            feedback_parts.append("Resume is well-formatted for ATS systems.")
        else:
            feedback_parts.append("Resume could be better optimized for ATS systems.")
        
        return " ".join(feedback_parts)
    
    async def score_application(self, db: Session, application: Application) -> ApplicationScore:
        """Score an application and return the score object"""
        try:
            # Get job details
            job = db.query(Job).filter(Job.id == application.job_id).first()
            if not job:
                raise ValueError(f"Job not found for application {application.id}")
            
            # Calculate match scores
            match_scores = self.calculate_match_score(job, application)
            
            # Calculate ATS scores
            parsed_data = {
                'parsed_skills': application.parsed_skills,
                'parsed_experience': application.parsed_experience,
                'parsed_education': application.parsed_education,
                'parsed_certifications': application.parsed_certifications
            }
            ats_scores = self.calculate_ats_score_breakdown(parsed_data, application.resume_filename)
            
            # Calculate final score
            match_score = sum(score for score in match_scores.values() if score > 0) / len([s for s in match_scores.values() if s > 0]) if any(match_scores.values()) else 0
            ats_score = sum(ats_scores.values()) / len(ats_scores) if ats_scores else 0
            final_score = self.calculate_final_score(match_scores, ats_scores)
            
            # Generate feedback
            all_scores = {**match_scores, **ats_scores}
            ai_feedback = self.generate_ai_feedback(job, application, all_scores)
            
            # Create score record
            application_score = ApplicationScore(
                application_id=application.id,
                match_score=match_score,
                ats_score=ats_score,
                final_score=final_score,
                skills_match=match_scores.get('skills_match'),
                experience_match=match_scores.get('experience_match'),
                education_match=match_scores.get('education_match'),
                certification_match=match_scores.get('certification_match'),
                ats_format_score=ats_scores.get('ats_format_score'),
                ats_keywords_score=ats_scores.get('ats_keywords_score'),
                ats_structure_score=ats_scores.get('ats_structure_score'),
                scoring_details=all_scores,
                ai_feedback=ai_feedback
            )
            
            db.add(application_score)
            db.commit()
            db.refresh(application_score)
            
            # Update application status based on score
            decision, status = self.determine_candidate_status(final_score)
            application.status = status
            db.commit()
            
            return application_score
            
        except Exception as e:
            logger.error(f"Error scoring application {application.id}: {e}")
            db.rollback()
            raise
