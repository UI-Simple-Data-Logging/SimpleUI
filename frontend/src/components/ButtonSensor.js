import React, { useState, useEffect } from 'react';

function ButtonSensor({ items }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter items to get only button sensors
  const buttonItems = items.filter(item => 
    item.name.toLowerCase().includes('button')
  );

  // Sort by timestamp (newest first)
  const sortedButtonItems = buttonItems.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Calculate time passed since last button press
  const calculateTimePassed = (timestamp) => {
    const buttonTime = new Date(timestamp);
    const diffMs = currentTime - buttonTime;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Calculate time difference between last two button presses
  const calculateLastTwoButtonsDiff = () => {
    if (sortedButtonItems.length < 2) return null;
    
    const lastButton = new Date(sortedButtonItems[0].timestamp);
    const secondLastButton = new Date(sortedButtonItems[1].timestamp);
    const diffMs = lastButton - secondLastButton;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const lastTwoButtonsDiff = calculateLastTwoButtonsDiff();

  if (buttonItems.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔘 Button Sensor Analytics</h3>
        <p className="text-yellow-700">No button sensor data found.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">🔘 Button Sensor Analytics</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700">Total Button Presses</h4>
          <p className="text-2xl font-bold text-blue-600">{buttonItems.length}</p>
        </div>
        
        {sortedButtonItems.length > 0 && (
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-700">Time Since Last Press</h4>
            <p className="text-2xl font-bold text-green-600">
              {calculateTimePassed(sortedButtonItems[0].timestamp)}
            </p>
          </div>
        )}
        
        {lastTwoButtonsDiff && (
          <div className="bg-white p-3 rounded border md:col-span-2">
            <h4 className="font-medium text-gray-700">Time Between Last Two Presses</h4>
            <p className="text-2xl font-bold text-purple-600">{lastTwoButtonsDiff}</p>
          </div>
        )}
      </div>

      {/* Recent Button Presses Table */}
      <div className="bg-white rounded border overflow-hidden">
        <h4 className="font-medium text-gray-700 p-3 bg-gray-50 border-b">Recent Button Presses</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Value</th>
                <th className="px-3 py-2 text-left">Timestamp</th>
                <th className="px-3 py-2 text-left">Time Ago</th>
              </tr>
            </thead>
            <tbody>
              {sortedButtonItems.slice(0, 5).map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{item.value}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-blue-600 font-medium">
                    {calculateTimePassed(item.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedButtonItems.length > 5 && (
          <div className="px-3 py-2 text-center text-gray-500 bg-gray-50 text-sm">
            Showing 5 of {sortedButtonItems.length} button presses
          </div>
        )}
      </div>
    </div>
  );
}

export default ButtonSensor;