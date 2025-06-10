import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StreetingChart({ items }) {
  // Group items by timestamp to show temp and speed on same chart
  const chartData = items.reduce((acc, item) => {
    const timestamp = new Date(item.timestamp).toLocaleTimeString();
    
    const existingEntry = acc.find(entry => entry.timestamp === timestamp);
    
    if (existingEntry) {
      if (item.name === 'Temperature') {
        existingEntry.temperature = parseFloat(item.value);
      } else if (item.name === 'Speed') {
        existingEntry.speed = parseFloat(item.value);
      }
    } else {
      const newEntry = { timestamp };
      if (item.name === 'Temperature') {
        newEntry.temperature = parseFloat(item.value);
      } else if (item.name === 'Speed') {
        newEntry.speed = parseFloat(item.value);
      }
      acc.push(newEntry);
    }
    
    return acc;
  }, []);

  // Sort by timestamp
  chartData.sort((a, b) => {
    const timeA = new Date(`2000/01/01 ${a.timestamp}`);
    const timeB = new Date(`2000/01/01 ${b.timestamp}`);
    return timeA - timeB;
  });

  // Take last 10 data points
  const recentData = chartData.slice(-10);

  if (recentData.length === 0) {
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
        <LineChart data={recentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              value, 
              name === 'temperature' ? 'Temperature (°C)' : 'Speed (km/h)'
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
            name="Speed (km/h)"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing last {recentData.length} data points
      </div>
    </div>
  );
}

export default StreetingChart;