import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    requirements: '',
    benefits: '',
    department: '',
    location: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    key_skills: [],
    deadline: '',
    status: 'draft'
  });

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const job = await jobService.getJob(id);
      
      // Check permissions
      if (user?.user_type !== 'admin' && 
          !(user?.user_type === 'account_manager' && job.created_by === user.id)) {
        setError('You do not have permission to edit this job.');
        return;
      }

      // Populate form
      setFormData({
        title: job.title || '',
        short_description: job.short_description || '',
        description: job.description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        department: job.department || '',
        location: job.location || '',
        job_type: job.job_type || '',
        experience_level: job.experience_level || '',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        key_skills: job.key_skills || [],
        deadline: job.deadline ? job.deadline.split('T')[0] : '',
        status: job.status || 'draft'
      });
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error loading job:', err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.user_type, user?.id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (skillsText) => {
    const skills = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({
      ...prev,
      key_skills: skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        deadline: formData.deadline || null
      };

      await jobService.updateJob(id, jobData);
      setSuccess('Job updated successfully!');
      
      // Navigate back to job details after a brief delay
      setTimeout(() => {
        navigate(`/jobs/${id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to update job. Please try again.');
      console.error('Error updating job:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button onClick={() => navigate(`/jobs/${id}`)} className="mr-4">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600">Loading job information...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/jobs')} className="mr-4">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600">Error loading job</p>
          </div>
        </div>
        <div className="card">
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(`/jobs/${id}`)} className="mr-4">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600">Update job posting details</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief summary of the role..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detailed job description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Required skills, qualifications, experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benefits
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Employee benefits, perks, compensation details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.key_skills.join(', ')}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="React, Node.js, JavaScript, Python, AWS"
                  />
                  {formData.key_skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.key_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Form */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Job Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select job type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Salary
                    </label>
                    <input
                      type="number"
                      name="salary_min"
                      value={formData.salary_min}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Salary
                    </label>
                    <input
                      type="number"
                      name="salary_max"
                      value={formData.salary_max}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="80000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    {user?.user_type === 'admin' && (
                      <>
                        <option value="approved">Approved</option>
                        <option value="published">Published</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                      Updating Job...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Update Job
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${id}`)}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditJob;