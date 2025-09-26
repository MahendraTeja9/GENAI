import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { 
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationReference, setApplicationReference] = useState('');

  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    cover_letter: '',
    additional_info: ''
  });
  const [resumeFile, setResumeFile] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.candidate_name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.candidate_email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!resumeFile) {
      setError('Resume is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('job_id', id);
      submitData.append('candidate_name', formData.candidate_name);
      submitData.append('candidate_email', formData.candidate_email);
      submitData.append('candidate_phone', formData.candidate_phone || '');
      submitData.append('cover_letter', formData.cover_letter || '');
      submitData.append('additional_info', formData.additional_info || '');
      submitData.append('resume', resumeFile);

      const response = await applicationService.submitApplication(submitData);
      
      setSuccess(true);
      setApplicationReference(response.reference_number || 'N/A');
      
      // Reset form
      setFormData({
        candidate_name: '',
        candidate_email: '',
        candidate_phone: '',
        cover_letter: '',
        additional_info: ''
      });
      setResumeFile(null);

    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card">
            <div className="text-center py-12">
              <XMarkIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link to="/careers" className="btn-primary">
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card">
            <div className="text-center py-12">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for applying to <strong>{job?.title}</strong>. 
                Your application has been received and will be processed by our AI system.
              </p>
              {applicationReference && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    <strong>Reference Number:</strong> {applicationReference}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Please save this reference number for future correspondence.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <Link to={`/careers/${job?.id}`} className="btn-secondary">
                  Back to Job Details
                </Link>
                <Link to="/careers" className="btn-primary">
                  Browse More Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to={`/careers/${job?.id}`} 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Job Details
          </Link>
          
          <div className="card">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Position</h1>
              <h2 className="text-xl text-primary-600 font-semibold">{job?.title}</h2>
              <p className="text-gray-600 mt-2">
                {job?.department} • {job?.location}
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="candidate_name"
                      value={formData.candidate_name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="candidate_email"
                      value={formData.candidate_email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="candidate_phone"
                      value={formData.candidate_phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Resume Upload *</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        required
                      />
                      <span className="btn-primary">
                        Choose Resume File
                      </span>
                    </label>
                    <p className="text-sm text-gray-600">
                      Upload your resume (PDF, DOC, DOCX - Max 5MB)
                    </p>
                    {resumeFile && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        <strong>Selected:</strong> {resumeFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Cover Letter</h3>
                <textarea
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
                <p className="text-sm text-gray-600 mt-1">
                  Optional: Share your motivation and relevant experience
                </p>
              </div>

              {/* Additional Information */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any additional information you'd like to share..."
                />
                <p className="text-sm text-gray-600 mt-1">
                  Optional: Portfolio links, certifications, availability, etc.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Summary */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">Position Summary</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Position:</span>
                    <div className="font-medium">{job?.title}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <div className="font-medium">{job?.department}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <div className="font-medium">{job?.location}</div>
                  </div>
                  {job?.job_type && (
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <div className="font-medium capitalize">{job.job_type.replace('-', ' ')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Processing Info */}
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-start">
                  <SparklesIcon className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">AI-Powered Processing</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Your application will be automatically analyzed by our AI system to match 
                      your skills and experience with the job requirements, ensuring fair and 
                      efficient processing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Skills */}
              {job?.key_skills && job.key_skills.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-3">Key Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.key_skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.key_skills.length > 6 && (
                      <span className="inline-block text-gray-500 text-xs px-2 py-1">
                        +{job.key_skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="card">
                {error && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-600 mt-2 text-center">
                  By submitting, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;