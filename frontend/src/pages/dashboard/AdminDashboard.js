import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { 
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    approvedJobs: 0,
    pendingJobs: 0,
    todayApplications: 0,
    weeklyApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [topPerformingJobs, setTopPerformingJobs] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load all jobs for stats
      const allJobs = await jobService.getJobs({ limit: 1000 });
      const publishedJobs = allJobs.filter(job => job.status === 'published');
      const approvedJobs = allJobs.filter(job => job.status === 'approved');
      const pendingJobs = allJobs.filter(job => job.status === 'pending_approval');

      // Load recent jobs
      const recentJobsData = await jobService.getJobs({ 
        limit: 5,
        sort: 'created_at',
        order: 'desc'
      });
      setRecentJobs(recentJobsData);

      // Load applications for stats
      const allApplications = await applicationService.getApplications({ limit: 1000 });
      
      // Calculate date-based stats
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const todayStr = today.toDateString();
      
      const todayApplications = allApplications.filter(app => 
        new Date(app.created_at).toDateString() === todayStr
      );
      
      const weeklyApplications = allApplications.filter(app => 
        new Date(app.created_at) >= weekAgo
      );

      // Calculate top performing jobs (most applications)
      const jobApplicationCounts = {};
      allApplications.forEach(app => {
        jobApplicationCounts[app.job_id] = (jobApplicationCounts[app.job_id] || 0) + 1;
      });
      
      const topJobs = allJobs
        .map(job => ({
          ...job,
          applicationCount: jobApplicationCounts[job.id] || 0
        }))
        .sort((a, b) => b.applicationCount - a.applicationCount)
        .slice(0, 5);
      
      setTopPerformingJobs(topJobs);

      setStats({
        totalJobs: allJobs.length,
        publishedJobs: publishedJobs.length,
        totalApplications: allApplications.length,
        totalUsers: 0, // We'd need a users endpoint for this
        approvedJobs: approvedJobs.length,
        pendingJobs: pendingJobs.length,
        todayApplications: todayApplications.length,
        weeklyApplications: weeklyApplications.length
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleJobPublish = async (jobId) => {
    try {
      await jobService.publishJob(jobId);
      loadDashboardData(); // Reload data
    } catch (err) {
      setError('Failed to publish job');
      console.error('Error publishing job:', err);
    }
  };

  const handleJobApprove = async (jobId) => {
    try {
      await jobService.approveJob(jobId);
      loadDashboardData(); // Reload data
    } catch (err) {
      setError('Failed to approve job');
      console.error('Error approving job:', err);
    }
  };

  const getJobStatusColor = (status) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Loading system overview...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System administration and analytics</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Published Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedJobs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
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
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingJobs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Today's Applications</p>
              <p className="text-xl font-bold text-gray-900">{stats.todayApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-xl font-bold text-gray-900">{stats.weeklyApplications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved Jobs</p>
              <p className="text-xl font-bold text-gray-900">{stats.approvedJobs}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Jobs</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.department} • {job.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`status-badge ${getJobStatusColor(job.status)}`}>
                          {getStatusText(job.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                        title="View Job"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {job.status === 'pending_approval' && (
                        <button
                          onClick={() => handleJobApprove(job.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                          title="Approve Job"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {job.status === 'approved' && (
                        <button
                          onClick={() => handleJobPublish(job.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Publish Job"
                        >
                          <GlobeAltIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent jobs</p>
            </div>
          )}
        </div>

        {/* Top Performing Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Performing Jobs</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>

          {topPerformingJobs.length > 0 ? (
            <div className="space-y-4">
              {topPerformingJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.department} • {job.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`status-badge ${getJobStatusColor(job.status)}`}>
                          {getStatusText(job.status)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {job.applicationCount} applications
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                        title="View Job"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/jobs?status=pending_approval"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-medium">Review Approvals</h3>
              <p className="text-sm text-gray-600">Approve pending jobs</p>
            </div>
          </Link>

          <Link
            to="/jobs?status=approved"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <GlobeAltIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium">Publish Jobs</h3>
              <p className="text-sm text-gray-600">Make jobs public</p>
            </div>
          </Link>

          <Link
            to="/applications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium">View Applications</h3>
              <p className="text-sm text-gray-600">Monitor all applications</p>
            </div>
          </Link>

          <Link
            to="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-gray-600">System metrics</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;