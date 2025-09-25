import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { 
  EyeIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserIcon,
  BriefcaseIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ApplicationList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    job_id: searchParams.get('job_id') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc'
  });

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        limit: 50
      };
      
      const data = await applicationService.getApplications(params);
      setApplications(data);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v.toString());
    });
    setSearchParams(params);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      loadApplications(); // Reload data
    } catch (err) {
      setError('Failed to update application status');
      console.error('Error updating application:', err);
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">Loading applications...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Manage candidate applications</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="created_at">Sort by Date</option>
            <option value="ai_score">Sort by AI Score</option>
            <option value="candidate_name">Sort by Name</option>
          </select>

          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={filters.order}
            onChange={(e) => handleFilterChange('order', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          <button
            onClick={() => {
              setFilters({ status: '', job_id: '', sort: 'created_at', order: 'desc' });
              setSearchParams(new URLSearchParams());
            }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Applications List */}
      <div className="card">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.candidate_name}
                      </h3>
                      <span className={`status-badge ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                        {application.job_title}
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {application.candidate_email}
                      </div>
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* AI Scores */}
                    {(application.ai_score || application.match_score || application.ats_score) && (
                      <div className="flex flex-wrap gap-4 mb-3">
                        {application.ai_score && (
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                            <span className={`text-sm font-medium ${getScoreColor(application.ai_score)}`}>
                              AI Score: {application.ai_score}%
                            </span>
                          </div>
                        )}
                        {application.match_score && (
                          <div className="flex items-center">
                            <span className={`text-sm ${getScoreColor(application.match_score)}`}>
                              Match: {application.match_score}%
                            </span>
                          </div>
                        )}
                        {application.ats_score && (
                          <div className="flex items-center">
                            <span className={`text-sm ${getScoreColor(application.ats_score)}`}>
                              ATS: {application.ats_score}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Summary */}
                    {application.ai_summary && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {application.ai_summary}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {/* View Application */}
                    <Link
                      to={`/applications/${application.id}`}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md text-center"
                      title="View Application"
                    >
                      <EyeIcon className="h-5 w-5 mx-auto" />
                    </Link>

                    {/* Status Actions */}
                    {(user?.user_type === 'hr' || user?.user_type === 'admin') && (
                      <div className="flex flex-col space-y-1">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                              title="Shortlist"
                            >
                              <CheckCircleIcon className="h-4 w-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Reject"
                            >
                              <XCircleIcon className="h-4 w-4 mx-auto" />
                            </button>
                          </>
                        )}
                        
                        {application.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'interview_scheduled')}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                              title="Schedule Interview"
                            >
                              <ClockIcon className="h-4 w-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Reject"
                            >
                              <XCircleIcon className="h-4 w-4 mx-auto" />
                            </button>
                          </>
                        )}
                        
                        {application.status === 'interview_scheduled' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'hired')}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                              title="Hire"
                            >
                              <CheckCircleIcon className="h-4 w-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Reject"
                            >
                              <XCircleIcon className="h-4 w-4 mx-auto" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {filters.status || filters.job_id 
                ? 'No applications match your current filters.' 
                : 'No applications have been submitted yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;