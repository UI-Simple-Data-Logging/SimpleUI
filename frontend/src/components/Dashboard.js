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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📊 Dashboard Overview</h2>
      <div className="bg-white p-4 rounded shadow mb-6">
        <ChartComponent data={items} />
      </div>
      <ItemList items={items} />
    </div>
  );
}

export default Dashboard;