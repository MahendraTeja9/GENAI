import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const HRDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pendingJobs: 0,
    totalApplications: 0,
    todayApplications: 0,
    interviewsScheduled: 0
  });
  const [pendingJobs, setPendingJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load pending jobs (waiting for HR approval)
      const jobsResponse = await jobService.getJobs({ 
        status: 'pending_approval',
        limit: 10 
      });
      setPendingJobs(jobsResponse);

      // Load recent applications
      const applicationsResponse = await applicationService.getApplications({
        limit: 10,
        sort: 'created_at',
        order: 'desc'
      });
      setRecentApplications(applicationsResponse);

      // Calculate stats
      const allJobs = await jobService.getJobs({ status: 'pending_approval' });
      const allApplications = await applicationService.getApplications();
      
      const today = new Date().toDateString();
      const todayApps = allApplications.filter(app => 
        new Date(app.created_at).toDateString() === today
      );

      setStats({
        pendingJobs: allJobs.length,
        totalApplications: allApplications.length,
        todayApplications: todayApps.length,
        interviewsScheduled: allApplications.filter(app => 
          app.status === 'interview_scheduled'
        ).length
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleJobApproval = async (jobId, approve) => {
    try {
      if (approve) {
        await jobService.approveJob(jobId);
      } else {
        // For rejection, we might need a separate endpoint
        // For now, we'll just update the job status to draft
        await jobService.updateJob(jobId, { status: 'draft' });
      }
      
      // Reload data
      loadDashboardData();
    } catch (err) {
      setError(`Failed to ${approve ? 'approve' : 'reject'} job`);
      console.error('Error handling job approval:', err);
    }
  };

  const getApplicationStatusColor = (status) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-600">Manage job approvals and candidate applications</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingJobs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Job Approvals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Job Approvals</h2>
            <Link to="/jobs?status=pending_approval" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>

          {pendingJobs.length > 0 ? (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.department} • {job.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleJobApproval(job.id, true)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleJobApproval(job.id, false)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Reject"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No jobs pending approval</p>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link to="/applications" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>

          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.slice(0, 5).map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {application.candidate_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Applied for: {application.job_title}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`status-badge ${getApplicationStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                        {application.ai_score && (
                          <span className="ml-2 text-xs text-gray-500">
                            AI Score: {application.ai_score}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/applications/${application.id}`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                        title="View Application"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent applications</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs?status=pending_approval"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-medium">Review Job Approvals</h3>
              <p className="text-sm text-gray-600">Approve or reject job postings</p>
            </div>
          </Link>

          <Link
            to="/applications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium">Manage Applications</h3>
              <p className="text-sm text-gray-600">Review candidate applications</p>
            </div>
          </Link>

          <Link
            to="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium">View Analytics</h3>
              <p className="text-sm text-gray-600">Job and application metrics</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;