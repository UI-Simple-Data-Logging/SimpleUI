// src/components/ItemForm.js
import React from 'react';

function ItemForm({ item, setItem, onSubmit, isEditing }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-4">Sensor Data Entry</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Print Pressure *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter print pressure (> 0)"
            value={item.printPressure}
            onChange={(e) => setItem({ ...item, printPressure: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ink Viscosity *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter ink viscosity (> 0)"
            value={item.inkViscosity}
            onChange={(e) => setItem({ ...item, inkViscosity: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Squeegee Speed *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter squeegee speed (> 0)"
            value={item.squeegeeSpeed}
            onChange={(e) => setItem({ ...item, squeegeeSpeed: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
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