import React, { useMemo } from 'react';

function LatestSensorValues({ items, onNavigateToLiveSensors }) {
  // Get latest sensor values
  const latestSensorData = useMemo(() => {
    if (!items || items.length === 0) return null;
    
    // Sort by timestamp and get the most recent item with sensor data
    const sortedItems = items
      .filter(item => item.timestamp && (
        item.temperature?.value || 
        item.speed?.value || 
        item.squeegeeSpeed?.value || 
        item.printPressure?.value || 
        item.inkViscosity?.value
      ))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (sortedItems.length === 0) return null;
    
    const latest = sortedItems[0];
    return {
      timestamp: new Date(latest.timestamp),
      temperature: latest.temperature?.value ? {
        value: parseFloat(latest.temperature.value),
        unit: latest.temperature.unit || '°C'
      } : null,
      speed: latest.speed?.value ? {
        value: parseFloat(latest.speed.value),
        unit: latest.speed.unit || 'mm/s'
      } : null,
      squeegeeSpeed: latest.squeegeeSpeed?.value ? {
        value: parseFloat(latest.squeegeeSpeed.value),
        unit: latest.squeegeeSpeed.unit || 'mm/s'
      } : null,
      printPressure: latest.printPressure?.value ? {
        value: parseFloat(latest.printPressure.value),
        unit: latest.printPressure.unit || 'N/m²'
      } : null,
      inkViscosity: latest.inkViscosity?.value ? {
        value: parseFloat(latest.inkViscosity.value),
        unit: latest.inkViscosity.unit || 'cP'
      } : null
    };
  }, [items]);

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Latest Sensor Values</h4>
        <button
          onClick={onNavigateToLiveSensors}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          📊 Live Sensor Data
        </button>
      </div>
      
      {latestSensorData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {latestSensorData.temperature && (
            <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Temperature</div>
              <div className="font-bold text-xl text-gray-800">{latestSensorData.temperature.value.toFixed(1)}<span className="text-sm font-normal text-gray-600">{latestSensorData.temperature.unit}</span></div>
            </div>
          )}
          {latestSensorData.speed && (
            <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Speed</div>
              <div className="font-bold text-xl text-gray-800">{latestSensorData.speed.value.toFixed(1)}<span className="text-sm font-normal text-gray-600">{latestSensorData.speed.unit}</span></div>
            </div>
          )}
          {latestSensorData.squeegeeSpeed && (
            <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Squeegee Speed</div>
              <div className="font-bold text-xl text-gray-800">{latestSensorData.squeegeeSpeed.value.toFixed(1)}<span className="text-sm font-normal text-gray-600">{latestSensorData.squeegeeSpeed.unit}</span></div>
            </div>
          )}
          {latestSensorData.printPressure && (
            <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Print Pressure</div>
              <div className="font-bold text-xl text-gray-800">{latestSensorData.printPressure.value.toFixed(1)}<span className="text-sm font-normal text-gray-600">{latestSensorData.printPressure.unit}</span></div>
            </div>
          )}
          {latestSensorData.inkViscosity && (
            <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Ink Viscosity</div>
              <div className="font-bold text-xl text-gray-800">{latestSensorData.inkViscosity.value.toFixed(1)}<span className="text-sm font-normal text-gray-600">{latestSensorData.inkViscosity.unit}</span></div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          No sensor data available
        </div>
      )}
      
      {latestSensorData && (
        <div className="text-xs text-gray-400 mt-2 text-center">
          Last updated: {latestSensorData.timestamp.toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default LatestSensorValues;
