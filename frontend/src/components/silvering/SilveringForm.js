import React, { useState } from 'react';

function SilveringForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    value: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.value.trim()) {
      return;
    }

    onSubmit(formData);
    setFormData({ value: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📝 Data Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter value"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !formData.value.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Submitting...
            </div>
          ) : (
            'Submit Data'
          )}
        </button>
      </form>
    </div>
  );
}

export default SilveringForm;