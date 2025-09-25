import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    job_type: ''
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getPublicJobs(filters);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Join Our Team
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Discover exciting career opportunities and grow with us
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">Human Resources</option>
            </select>
            
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="London">London</option>
            </select>
            
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.job_type}
              onChange={(e) => handleFilterChange('job_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {job.short_description || job.description.substring(0, 150) + '...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {job.department && (
                      <div className="flex items-center text-sm text-gray-500">
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        {job.department}
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {job.location}
                      </div>
                    )}
                    {job.job_type && (
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {job.job_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    )}
                  </div>

                  {job.key_skills && job.key_skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {job.key_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.key_skills.length > 3 && (
                          <span className="inline-block text-gray-500 text-xs px-2 py-1">
                            +{job.key_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Link
                      to={`/careers/job/${job.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/careers/apply/${job.id}`}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search or filters.' : 'Check back later for new opportunities.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareersPage;
