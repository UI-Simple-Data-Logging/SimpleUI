import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StreetingChart({ items }) {
  const chartData = items
    .filter(item => item.temperature?.value && item.speed?.value)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp, newest first
    .slice(0, 10) // Take the 10 most recent
    .map(item => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      temperature: item.temperature.value,
      speed: item.speed.value
    }))
    .reverse(); // Reverse for chronological order in chart (oldest to newest)

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Temperature & Speed Chart</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for chart
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Temperature & Speed Chart</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              value, 
              name === 'temperature' ? 'Temperature (°C)' : 'Speed (mm/s)'
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#ef4444" 
            name="Temperature (°C)"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke="#3b82f6" 
            name="Speed (mm/s)"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing last {chartData.length} data points
      </div>
    </div>
  );
}

export default StreetingChart;