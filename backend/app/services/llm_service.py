import openai
from typing import List, Dict, Any
from ..config import settings
import logging
import json

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
    
    async def generate_job_fields(self, project_name: str, role_title: str, role_description: str) -> Dict[str, Any]:
        """Generate additional job fields using LLM"""
        try:
            prompt = f"""
            Based on the following job information, suggest relevant fields for a job posting:
            
            Project Name: {project_name}
            Role Title: {role_title}
            Role Description: {role_description}
            
            Please provide a JSON response with the following structure:
            {{
                "key_skills": ["skill1", "skill2", "skill3"],
                "required_experience": "X years of experience in...",
                "certifications": ["cert1", "cert2"],
                "additional_requirements": ["req1", "req2"]
            }}
            
            Make sure the suggestions are relevant to the role and realistic.
            """
            
            response = await openai.ChatCompletion.acreate(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": "You are an expert HR assistant helping to create detailed job descriptions. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to extract JSON from the response
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return self._fallback_job_fields(role_title)
                
        except Exception as e:
            logger.error(f"Error generating job fields: {e}")
            return self._fallback_job_fields(role_title)
    
    async def generate_job_description(
        self, 
        project_name: str, 
        role_title: str, 
        role_description: str,
        key_skills: List[str],
        required_experience: str,
        certifications: List[str],
        additional_requirements: List[str]
    ) -> Dict[str, str]:
        """Generate complete job description using LLM"""
        try:
            skills_str = ", ".join(key_skills)
            certs_str = ", ".join(certifications)
            reqs_str = ", ".join(additional_requirements)
            
            prompt = f"""
            Create a professional job description based on the following information:
            
            Project Name: {project_name}
            Role Title: {role_title}
            Basic Description: {role_description}
            Key Skills: {skills_str}
            Required Experience: {required_experience}
            Certifications: {certs_str}
            Additional Requirements: {reqs_str}
            
            Please provide a JSON response with:
            {{
                "description": "A comprehensive job description with sections for responsibilities, requirements, and benefits",
                "short_description": "A brief 2-3 sentence summary of the role"
            }}
            
            Make the description professional, engaging, and well-structured.
            """
            
            response = await openai.ChatCompletion.acreate(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": "You are an expert HR professional creating compelling job descriptions. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content.strip()
            
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                return self._fallback_job_description(role_title, role_description)
                
        except Exception as e:
            logger.error(f"Error generating job description: {e}")
            return self._fallback_job_description(role_title, role_description)
    
    def _fallback_job_fields(self, role_title: str) -> Dict[str, Any]:
        """Fallback job fields if LLM fails"""
        # Simple keyword-based suggestions
        tech_roles = ["developer", "engineer", "programmer", "architect"]
        data_roles = ["data", "analyst", "scientist"]
        management_roles = ["manager", "lead", "director"]
        
        role_lower = role_title.lower()
        
        if any(tech in role_lower for tech in tech_roles):
            return {
                "key_skills": ["Programming", "Problem Solving", "Team Collaboration"],
                "required_experience": "2-5 years of relevant experience",
                "certifications": ["Relevant technical certifications"],
                "additional_requirements": ["Strong communication skills", "Ability to work in agile environment"]
            }
        elif any(data in role_lower for data in data_roles):
            return {
                "key_skills": ["Data Analysis", "SQL", "Statistical Analysis"],
                "required_experience": "2-4 years in data analysis",
                "certifications": ["Data analysis certifications"],
                "additional_requirements": ["Attention to detail", "Business acumen"]
            }
        else:
            return {
                "key_skills": ["Communication", "Leadership", "Problem Solving"],
                "required_experience": "3-5 years of relevant experience",
                "certifications": ["Industry relevant certifications"],
                "additional_requirements": ["Team management skills", "Strategic thinking"]
            }
    
    def _fallback_job_description(self, role_title: str, role_description: str) -> Dict[str, str]:
        """Fallback job description if LLM fails"""
        return {
            "description": f"""
            Position: {role_title}
            
            Job Description:
            {role_description}
            
            Responsibilities:
            • Execute primary job functions as outlined
            • Collaborate with team members effectively
            • Contribute to project success and company goals
            • Maintain high standards of work quality
            
            Requirements:
            • Relevant experience in the field
            • Strong communication and teamwork skills
            • Ability to work independently and manage priorities
            • Commitment to continuous learning and improvement
            
            Benefits:
            • Competitive salary package
            • Professional development opportunities
            • Collaborative work environment
            • Health and wellness benefits
            """,
            "short_description": f"We are seeking a qualified {role_title} to join our team. This role involves {role_description.lower()[:100]}..."
        }
