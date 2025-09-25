import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/careers" className="text-xl font-bold text-gray-900">
                GenAI Hiring
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link
                to="/careers"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Browse Jobs
              </Link>
              <Link
                to="/application-status"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Check Application
              </Link>
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium rounded-md"
              >
                Staff Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 GenAI Hiring System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
