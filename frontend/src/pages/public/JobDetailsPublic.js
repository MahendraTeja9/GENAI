import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const JobDetailsPublic = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await jobService.getPublicJob(id);
      setJob(data);
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error loading job:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="card">
            <div className="text-center py-12">
              <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
              <p className="text-gray-600 mb-4">
                {error || 'The requested job could not be found.'}
              </p>
              <Link to="/careers" className="btn-primary">
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/careers" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  {job.department && (
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      {job.department}
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {job.location}
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      {job.job_type}
                    </div>
                  )}
                </div>
                {job.short_description && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {job.short_description}
                  </p>
                )}
              </div>
              <div className="mt-6 md:mt-0 md:ml-6">
                <Link
                  to={`/careers/${job.id}/apply`}
                  className="btn-primary text-lg px-8 py-3 w-full md:w-auto text-center"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">About This Role</h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {job.description || 'No description available.'}
                </div>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">What We're Looking For</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {job.requirements}
                  </div>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">What We Offer</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {job.benefits}
                  </div>
                </div>
              </div>
            )}

            {/* Key Skills */}
            {job.key_skills && job.key_skills.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Key Skills & Technologies</h2>
                <div className="flex flex-wrap gap-3">
                  {job.key_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-4 py-2 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Section */}
            <div className="card bg-primary-50 border-primary-200">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-primary-900 mb-2">
                  Ready to Join Our Team?
                </h2>
                <p className="text-primary-700 mb-4">
                  We'd love to hear from you! Submit your application today.
                </p>
                <Link
                  to={`/careers/${job.id}/apply`}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Apply for This Position
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Job Details</h3>
              <div className="space-y-4">
                {job.job_type && (
                  <div className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Employment Type</div>
                      <div className="font-medium capitalize">{job.job_type.replace('-', ' ')}</div>
                    </div>
                  </div>
                )}

                {job.experience_level && (
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Experience Level</div>
                      <div className="font-medium capitalize">{job.experience_level} Level</div>
                    </div>
                  </div>
                )}

                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-start">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Salary Range</div>
                      <div className="font-medium">
                        {job.salary_min && job.salary_max 
                          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                          : job.salary_min 
                          ? `From $${job.salary_min.toLocaleString()}`
                          : job.salary_max 
                          ? `Up to $${job.salary_max.toLocaleString()}`
                          : 'Competitive'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Posted Date</div>
                    <div className="font-medium">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {job.deadline && (
                  <div className="flex items-start">
                    <TagIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Application Deadline</div>
                      <div className="font-medium">
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">About the Company</h3>
              <p className="text-gray-700 leading-relaxed">
                Join our innovative team and be part of building the future of technology. 
                We offer a collaborative environment, competitive benefits, and opportunities 
                for professional growth.
              </p>
            </div>

            {/* Application Process */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Application Process</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-sm">Submit Application</div>
                    <div className="text-xs text-gray-600">Upload your resume and cover letter</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-sm">AI Screening</div>
                    <div className="text-xs text-gray-600">Automated analysis of your qualifications</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-sm">HR Review</div>
                    <div className="text-xs text-gray-600">Human review and shortlisting</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-sm">Interview</div>
                    <div className="text-xs text-gray-600">Technical and cultural fit interview</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Job */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Share This Job</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 btn-secondary text-sm"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => window.open(`mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="flex-1 btn-secondary text-sm"
                >
                  Share via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPublic;