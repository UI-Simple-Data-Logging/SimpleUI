// frontend/src/App.js
import React from 'react';
import './App.css';
import ItemManager from './components/ItemManager';

function App() {
  return (
    <div className="App">
      <h1>Simple Data Logging UI</h1>
      <ItemManager />
    </div>
  );
}

export default App;