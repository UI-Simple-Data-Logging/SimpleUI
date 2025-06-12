import React, { useState } from 'react';

const DEVICE_OPTIONS = ['encoder', 'thermometer', 'manual'];
const METRIC_OPTIONS = ['Voids', 'Conductivity', 'Thickness'];

function StreetingForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    temperature: '',
    speed: '',
    deviceSource: 'encoder',
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
    onSubmit(formData);
    setFormData(prev => ({
      ...prev,
      temperature: '',
      speed: ''
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📝 Sensor Data Entry</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🌡️ Temperature *</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            placeholder="Enter temperature (°C)"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">Unit: °C</p>
        </div>

        {/* Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">⚡ Speed *</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.speed}
            onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
            placeholder="Enter speed (mm/s)"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">Unit: mm/s</p>
        </div>

        {/* Device Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Source</label>
          <select
            value={formData.deviceSource}
            onChange={(e) => setFormData({ ...formData, deviceSource: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {DEVICE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
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

        {/* Target Metrics Affected */}
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

        {/* Submit */}
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

export default StreetingForm;