import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const JobList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    created_by_me: searchParams.get('created_by_me') === 'true' || false
  });

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        limit: 50
      };
      
      const data = await jobService.getJobs(params);
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

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

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await jobService.deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    }
  };

  const handleApproveJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to approve this job?')) {
      return;
    }

    try {
      await jobService.approveJob(jobId);
      // Reload jobs to get updated status
      loadJobs();
      alert('Job approved successfully. You can now publish it to careers page.');
    } catch (err) {
      setError('Failed to approve job');
      console.error('Error approving job:', err);
      alert('Failed to approve job. ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePublishJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to publish this job to the careers page?')) {
      return;
    }

    try {
      await jobService.publishJob(jobId);
      // Reload jobs to get updated status
      loadJobs();
      alert('Job published successfully. It is now visible on the careers page.');
    } catch (err) {
      setError('Failed to publish job');
      console.error('Error publishing job:', err);
      alert('Failed to publish job. ' + (err.response?.data?.detail || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Approval';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage and track your job postings</p>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage and track your job postings</p>
        </div>
        {(user?.user_type === 'account_manager' || user?.user_type === 'admin') && (
          <Link
            to="/jobs/create"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Job
          </Link>
        )}
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
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>

          {user?.user_type === 'account_manager' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={filters.created_by_me}
                onChange={(e) => handleFilterChange('created_by_me', e.target.checked)}
              />
              <span className="text-sm">My Jobs Only</span>
            </label>
          )}

          <button
            onClick={() => {
              setFilters({ status: '', created_by_me: false });
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

      {/* Jobs List */}
      <div className="card">
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`status-badge ${getStatusColor(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      {job.department && (
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          {job.department}
                        </div>
                      )}
                      {job.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Created: {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {job.short_description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {job.short_description}
                      </p>
                    )}

                    {job.key_skills && job.key_skills.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {job.key_skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.key_skills.length > 5 && (
                            <span className="inline-block text-gray-500 text-xs px-2 py-1">
                              +{job.key_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                      title="View Job"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    
                    {/* HR Approval Button */}
                    {(user?.user_type === 'hr' || user?.user_type === 'admin') && 
                     job.status === 'pending_approval' && (
                      <button
                        onClick={() => handleApproveJob(job.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Approve Job"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* HR Publish Button */}
                    {(user?.user_type === 'hr' || user?.user_type === 'admin') && 
                     job.status === 'approved' && (
                      <button
                        onClick={() => handlePublishJob(job.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Publish to Careers Page"
                      >
                        <GlobeAltIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    {(user?.user_type === 'admin' || 
                      (user?.user_type === 'account_manager' && job.created_by === user.id)) && (
                      <>
                        <Link
                          to={`/jobs/${job.id}/edit`}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                          title="Edit Job"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete Job"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {filters.status || filters.created_by_me 
                ? 'No jobs match your current filters.' 
                : 'Start by creating your first job posting.'}
            </p>
            {(user?.user_type === 'account_manager' || user?.user_type === 'admin') && (
              <Link
                to="/jobs/create"
                className="btn-primary"
              >
                Create New Job
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
