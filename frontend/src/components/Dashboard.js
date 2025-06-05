// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { getItems } from '../utils/api';
import ChartComponent from './ChartComponent';
import ItemList from './ItemList';

function Dashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getItems().then(setItems);
  }, []);

  // Group items by name and keep only 5 most recent for each
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {});

  // Sort each group by timestamp (assuming you have a timestamp field) and take last 5
  Object.keys(groupedItems).forEach(key => {
    groupedItems[key] = groupedItems[key]
      .sort((a, b) => new Date(a.timestamp || a.createdAt || a.date) - new Date(b.timestamp || b.createdAt || b.date))
      .slice(-5); // Take last 5 items
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📊 Dashboard Overview</h2>
      {Object.entries(groupedItems)
        .filter(([sensorName]) => sensorName !== 'Button')
        .map(([sensorName, sensorData]) => (
        <div key={sensorName} className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-medium mb-3 text-center">{sensorName.charAt(0).toUpperCase() + sensorName.slice(1)}</h3>
          <ChartComponent data={sensorData} />
        </div>
      ))}
      {/* <ItemList items={items} /> */}
    </div>
  );
}

export default Dashboard;