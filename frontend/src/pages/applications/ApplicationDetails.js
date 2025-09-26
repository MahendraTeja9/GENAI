import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  StarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await applicationService.getApplication(id);
      setApplication(data);
    } catch (err) {
      setError('Failed to load application details');
      console.error('Error loading application:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await applicationService.updateApplicationStatus(id, newStatus);
      await loadApplication(); // Reload data
    } catch (err) {
      setError('Failed to update application status');
      console.error('Error updating application:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'interview_scheduled':
        return 'Interview Scheduled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const canUpdateStatus = user?.user_type === 'hr' || user?.user_type === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/applications')} className="mr-4">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">Loading application information...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/applications')} className="mr-4">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">Error loading application</p>
          </div>
        </div>
        <div className="card">
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
            {error || 'Application not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <button onClick={() => navigate('/applications')} className="mr-4">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{application.candidate_name}</h1>
            <p className="text-gray-600">Application for {application.job_title}</p>
            <div className="flex items-center mt-2">
              <span className={`status-badge ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Update Actions */}
        {canUpdateStatus && (
          <div className="flex space-x-2">
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('shortlisted')}
                  disabled={updating}
                  className="btn-secondary flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="btn-danger flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </>
            )}
            
            {application.status === 'shortlisted' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('interview_scheduled')}
                  disabled={updating}
                  className="btn-primary flex items-center"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Schedule Interview
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="btn-danger flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </>
            )}
            
            {application.status === 'interview_scheduled' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('hired')}
                  disabled={updating}
                  className="btn-primary flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Hire
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="btn-danger flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Analysis */}
          {(application.ai_score || application.match_score || application.ats_score) && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">AI Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {application.ai_score && (
                  <div className={`p-4 rounded-lg ${getScoreColor(application.ai_score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall AI Score</span>
                      <StarIcon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold mt-1">{application.ai_score}%</div>
                  </div>
                )}
                {application.match_score && (
                  <div className={`p-4 rounded-lg ${getScoreColor(application.match_score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Match Score</span>
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold mt-1">{application.match_score}%</div>
                  </div>
                )}
                {application.ats_score && (
                  <div className={`p-4 rounded-lg ${getScoreColor(application.ats_score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ATS Score</span>
                      <DocumentTextIcon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold mt-1">{application.ats_score}%</div>
                  </div>
                )}
              </div>
              
              {application.ai_summary && (
                <div>
                  <h3 className="font-medium mb-2">AI Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{application.ai_summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Cover Letter</h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {application.cover_letter}
                </div>
              </div>
            </div>
          )}

          {/* Resume Content */}
          {application.resume_text && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Resume Content</h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 text-sm">
                  {application.resume_text}
                </div>
              </div>
            </div>
          )}

          {/* Skills Match */}
          {application.skills_match && application.skills_match.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Skills Analysis</h2>
              <div className="space-y-2">
                {application.skills_match.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{skill.skill}</span>
                    <span className={`text-sm ${skill.match ? 'text-green-600' : 'text-red-600'}`}>
                      {skill.match ? '✓ Match' : '✗ Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{application.candidate_name}</div>
                </div>
              </div>

              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{application.candidate_email}</div>
                </div>
              </div>

              {application.candidate_phone && (
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{application.candidate_phone}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Applied Position</div>
                  <div className="font-medium">{application.job_title}</div>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Application Date</div>
                  <div className="font-medium">
                    {new Date(application.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Download */}
          {application.resume_filename && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Resume</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium text-sm">{application.resume_filename}</div>
                    <div className="text-xs text-gray-500">Resume file</div>
                  </div>
                </div>
                <button
                  onClick={() => window.open(application.resume_url, '_blank')}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                  title="View Resume"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {application.additional_info && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {application.additional_info}
              </p>
            </div>
          )}

          {/* Application Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium">Application Submitted</div>
                  <div className="text-xs text-gray-500">
                    {new Date(application.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {application.processed_at && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">AI Processing Complete</div>
                    <div className="text-xs text-gray-500">
                      {new Date(application.processed_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              {application.updated_at !== application.created_at && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">Status Updated</div>
                    <div className="text-xs text-gray-500">
                      {new Date(application.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;