import React from 'react';

function ItemForm({ item, setItem, onSubmit, isEditing }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit' : 'Add'} Sensor Data
      </h3>

      <div className="space-y-4">

        {/* Parameter Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parameter *</label>
          <select
            value={item.parameter}
            onChange={(e) => setItem({ ...item, parameter: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select parameter</option>
            <option value="Print Pressure">Print Pressure</option>
            <option value="Ink Viscosity">Ink Viscosity</option>
            <option value="Squeegee Speed">Squeegee Speed</option>
            <option value="Humidity">Humidity</option>
            <option value="Temperature">Temperature</option>
          </select>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
          <input
            type="number"
            step="0.01"
            placeholder="Enter numeric value"
            value={item.value}
            onChange={(e) => setItem({ ...item, value: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Process Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Process *</label>
          <select
            value={item.processType}
            onChange={(e) => setItem({ ...item, processType: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select process</option>
            <option value="silvering">Silvering</option>
            <option value="streeting">Streeting</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={item.priority}
            onChange={(e) => setItem({ ...item, priority: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="L">Low</option>
            <option value="M">Medium</option>
            <option value="H">High</option>
          </select>
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Metric</label>
          <select
            value={item.targetMetricAffected}
            onChange={(e) => setItem({ ...item, targetMetricAffected: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Voids">Voids</option>
            <option value="Conductivity">Conductivity</option>
          </select>
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {isEditing ? 'Update Sensor Data' : 'Submit Sensor Data'}
        </button>
      </div>
    </div>
  );
}

export default ItemForm;