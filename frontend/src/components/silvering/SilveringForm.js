import React, { useState } from 'react';

const METRIC_OPTIONS = ['Voids', 'Conductivity', 'Thickness'];

function SilveringForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    squeegeeSpeed: '',
    printPressure: '',
    inkViscosity: '',
    humidity: '',
    priority: 'M',
    targetMetricAffected: []
  });

  const toggleMetric = (metric) => {
    setFormData(prev => ({
      ...prev,
      targetMetricAffected: prev.targetMetricAffected.includes(metric)
        ? prev.targetMetricAffected.filter(m => m !== metric)
        : [...prev.targetMetricAffected, metric]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.squeegeeSpeed.trim() || !formData.printPressure.trim() || !formData.inkViscosity.trim() || !formData.humidity.trim()) return;

    onSubmit(formData);
    setFormData({
      squeegeeSpeed: '',
      printPressure: '',
      inkViscosity: '',
      humidity: '',
      priority: 'M',
      targetMetricAffected: []
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📝 Silvering Data Entry</h3>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Squeegee Speed (mm/s) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.squeegeeSpeed}
            onChange={(e) => setFormData({ ...formData, squeegeeSpeed: e.target.value })}
            placeholder="Enter squeegee speed"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Print Pressure (N) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.printPressure}
            onChange={(e) => setFormData({ ...formData, printPressure: e.target.value })}
            placeholder="Enter print pressure"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ink Viscosity (cP) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.inkViscosity}
            onChange={(e) => setFormData({ ...formData, inkViscosity: e.target.value })}
            placeholder="Enter ink viscosity"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.humidity}
            onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
            placeholder="Enter humidity percentage"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="L">Low</option>
            <option value="M">Medium</option>
            <option value="H">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Metrics Affected</label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.map(metric => (
              <button
                key={metric}
                type="button"
                className={`px-3 py-1 border rounded text-sm ${
                  formData.targetMetricAffected.includes(metric)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() => toggleMetric(metric)}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Data'}
        </button>
      </form>
    </div>
  );
}

export default SilveringForm;