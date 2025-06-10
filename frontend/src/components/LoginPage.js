import React, { useState } from 'react';
import { toast } from 'react-toastify';

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    department: '',
    username: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.department || !formData.username.trim()) {
      toast.error('Please select a department and enter username');
      return;
    }

    onLogin(formData);
    toast.success(`Welcome to ${formData.department} dashboard!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Simple Data Logging
          </h1>
          <p className="text-gray-600">Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Department</option>
              <option value="silvering">Silvering</option>
              <option value="streeting">Streeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;