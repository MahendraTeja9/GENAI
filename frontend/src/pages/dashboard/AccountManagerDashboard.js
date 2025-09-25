import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AccountManagerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    draftJobs: 0,
    pendingApproval: 0,
    publishedJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const jobsData = await jobService.getJobs({ created_by_me: true, limit: 10 });
      setJobs(jobsData);
      
      // Calculate stats
      const stats = jobsData.reduce((acc, job) => {
        acc.totalJobs++;
        switch (job.status) {
          case 'draft':
            acc.draftJobs++;
            break;
          case 'pending_approval':
            acc.pendingApproval++;
            break;
          case 'published':
            acc.publishedJobs++;
            break;
          default:
            break;
        }
        return acc;
      }, { totalJobs: 0, draftJobs: 0, pendingApproval: 0, publishedJobs: 0 });
      
      setStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Manager Dashboard</h1>
          <p className="text-gray-600">Manage your job postings and track their progress</p>
        </div>
        <Link
          to="/jobs/create"
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftJobs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedJobs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
          <Link
            to="/jobs"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All Jobs
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                      <span className={`status-badge ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{job.department} • {job.location}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first job posting</p>
            <Link
              to="/jobs/create"
              className="btn-primary"
            >
              Create New Job
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <PlusIcon className="h-6 w-6 text-primary-600 mr-3" />
            <span className="font-medium">Create New Job</span>
          </Link>
          
          <Link
            to="/jobs?status=draft"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <DocumentTextIcon className="h-6 w-6 text-gray-600 mr-3" />
            <span className="font-medium">Review Drafts</span>
          </Link>
          
          <Link
            to="/jobs?status=pending_approval"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ClockIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <span className="font-medium">Pending Approval</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountManagerDashboard;
