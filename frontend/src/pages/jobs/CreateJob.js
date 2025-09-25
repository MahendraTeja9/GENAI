import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { 
  SparklesIcon, 
  DocumentTextIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CreateJob = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Details
  const [basicDetails, setBasicDetails] = useState({
    project_name: '',
    role_title: '',
    role_description: ''
  });

  // Step 2: AI Generated Fields
  const [aiFields, setAiFields] = useState({
    key_skills: [],
    required_experience: '',
    certifications: [],
    additional_requirements: []
  });

  // Step 3: Final Job Description
  const [jobDescription, setJobDescription] = useState({
    description: '',
    short_description: ''
  });

  // Step 4: Additional Details
  const [additionalDetails, setAdditionalDetails] = useState({
    department: '',
    location: '',
    job_type: 'full-time',
    experience_level: '',
    salary_range: ''
  });

  const handleBasicDetailsChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleGenerateFields = async () => {
    if (!basicDetails.project_name || !basicDetails.role_title || !basicDetails.role_description) {
      setError('Please fill in all basic details before generating AI fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await jobService.generateJobFields(basicDetails);
      setAiFields(response);
      setCurrentStep(2);
    } catch (err) {
      setError('Failed to generate AI fields. Please try again or continue manually.');
      console.error('AI Generation Error:', err);
      // Allow user to proceed manually
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleAiFieldsChange = (field, value) => {
    setAiFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field, index, value) => {
    setAiFields(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setAiFields(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setAiFields(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleGenerateDescription = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await jobService.generateJobDescription({
        ...basicDetails,
        ...aiFields
      });
      setJobDescription(response);
      setCurrentStep(3);
    } catch (err) {
      setError('Failed to generate job description. Please write it manually.');
      console.error('Description Generation Error:', err);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (field, value) => {
    setJobDescription(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalDetailsChange = (e) => {
    const { name, value } = e.target;
    setAdditionalDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitJob = async () => {
    try {
      setLoading(true);
      setError('');
      
      const jobData = {
        title: basicDetails.role_title,
        description: jobDescription.description || basicDetails.role_description,
        short_description: jobDescription.short_description,
        department: additionalDetails.department,
        location: additionalDetails.location,
        job_type: additionalDetails.job_type,
        experience_level: additionalDetails.experience_level,
        salary_range: additionalDetails.salary_range
      };

      const response = await jobService.createJob(jobData);
      navigate(`/jobs/${response.id}`);
    } catch (err) {
      setError('Failed to create job. Please try again.');
      console.error('Job Creation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Basic Details',
    'AI Generated Fields',
    'Job Description', 
    'Additional Details'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-600">Create a new job posting with AI assistance</p>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 <= currentStep 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index + 1 <= currentStep ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <div className={`w-12 h-px mx-4 ${
                  index + 1 < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Job Details</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  name="project_name"
                  className="input-field"
                  placeholder="e.g., Mobile App Development, Website Redesign"
                  value={basicDetails.project_name}
                  onChange={handleBasicDetailsChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  name="role_title"
                  className="input-field"
                  placeholder="e.g., Senior Frontend Developer, UI/UX Designer"
                  value={basicDetails.role_title}
                  onChange={handleBasicDetailsChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Description
                </label>
                <textarea
                  name="role_description"
                  rows={4}
                  className="input-field"
                  placeholder="Briefly describe the role, key responsibilities, and what the candidate will be working on..."
                  value={basicDetails.role_description}
                  onChange={handleBasicDetailsChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateFields}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <SparklesIcon className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Generating...' : 'Generate AI Fields'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Generated Fields */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">AI Generated Fields</h2>
            <p className="text-gray-600">Review and edit the AI-generated fields below:</p>

            {/* Key Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Skills
              </label>
              {aiFields.key_skills.map((skill, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="input-field mr-2"
                    value={skill}
                    onChange={(e) => handleArrayFieldChange('key_skills', index, e.target.value)}
                    placeholder="Enter skill"
                  />
                  <button
                    onClick={() => removeArrayItem('key_skills', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('key_skills')}
                className="btn-outline flex items-center text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Skill
              </button>
            </div>

            {/* Required Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Experience
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={aiFields.required_experience}
                onChange={(e) => handleAiFieldsChange('required_experience', e.target.value)}
                placeholder="Describe the required experience..."
              />
            </div>

            {/* Additional Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  className="input-field"
                  placeholder="e.g., Engineering, Marketing"
                  value={additionalDetails.department}
                  onChange={handleAdditionalDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="input-field"
                  placeholder="e.g., Remote, New York"
                  value={additionalDetails.location}
                  onChange={handleAdditionalDetailsChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="job_type"
                  className="input-field"
                  value={additionalDetails.job_type}
                  onChange={handleAdditionalDetailsChange}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  name="experience_level"
                  className="input-field"
                  value={additionalDetails.experience_level}
                  onChange={handleAdditionalDetailsChange}
                >
                  <option value="">Select Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Principal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleGenerateDescription}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Generating...' : 'Generate Job Description'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Job Description & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
            <p className="text-gray-600">Review and edit the AI-generated job description:</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={jobDescription.short_description}
                onChange={(e) => handleDescriptionChange('short_description', e.target.value)}
                placeholder="Brief summary of the role (2-3 sentences)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Job Description
              </label>
              <textarea
                className="input-field"
                rows={12}
                value={jobDescription.description}
                onChange={(e) => handleDescriptionChange('description', e.target.value)}
                placeholder="Complete job description with responsibilities, requirements, and benefits"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleSubmitJob}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Job...
                  </div>
                ) : (
                  'Create Job'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateJob;
