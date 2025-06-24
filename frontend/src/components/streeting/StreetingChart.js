import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Fixed Y-axis constants for temperature (positive)
const TEMP_Y_MIN = 0;
const TEMP_Y_MAX = 100;

// Fixed Y-axis constants for speed (negative)
const SPEED_Y_MIN = -100;
const SPEED_Y_MAX = 0;

function StreetingChart({ items }) {
  const chartData = items
    .filter(item => item.temperature?.value && item.speed?.value)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp, newest first
    .slice(0, 10) // Take the 10 most recent
    .map(item => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      temperature: item.temperature.value,
      speed: -Math.abs(item.speed.value) // Make speed negative to display below zero
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
        <LineChart data={chartData} isAnimationActive={false}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis 
            yAxisId="temp"
            orientation="left"
            domain={[SPEED_Y_MIN, TEMP_Y_MAX]}
            tickFormatter={(value) => {
              if (value >= 0) return `${value}°C`;
              return `${Math.abs(value)} mm/s`;
            }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'temperature') {
                return [value, 'Temperature (°C)'];
              } else {
                return [Math.abs(value), 'Speed (mm/s)'];
              }
            }}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'temperature') return 'Temperature (°C)';
              return 'Speed (mm/s)';
            }}
          />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="temperature" 
            stroke="#ef4444" 
            name="temperature"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            isAnimationActive={false}
          />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="speed" 
            stroke="#3b82f6" 
            name="speed"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing last {chartData.length} data points • Temperature (0-100°C) above, Speed (0-100 mm/s) below
      </div>
    </div>
  );
}

export default StreetingChart;