import React from 'react';
import './index.css'; // Tailwind
import './App.css';   // Custom global styles
import ItemManager from './components/ItemManager';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          🔧 Simple Data Logging UI
        </h1>
        <ItemManager />
      </div>
    </div>
  );
}

export default App;