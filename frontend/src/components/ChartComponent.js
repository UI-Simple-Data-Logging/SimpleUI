// src/components/ChartComponent.js
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function ChartComponent({ data }) {
  const chartData = data.map(item => ({
    timestamp: new Date(item.createdAt || item.timestamp || Date.now()).toLocaleTimeString(),
    value: Number(item.value),
    name: item.name
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip 
          formatter={(value, name, props) => [value, props.payload.name]}
        />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ChartComponent;