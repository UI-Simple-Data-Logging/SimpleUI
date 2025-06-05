import React, { useState, useEffect } from 'react';

function ButtonSensor({ items }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Threshold constants (in seconds)
  const THRESHOLDS = {
    GOOD: 30,     
    WARNING: 180, 
    CRITICAL: 360 
  };

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

  // Get status color based on time difference in seconds
  const getStatusColor = (timeInSeconds) => {
    if (timeInSeconds <= THRESHOLDS.GOOD) {
      return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    } else if (timeInSeconds <= THRESHOLDS.WARNING) {
      return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else {
      return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    }
  };

  // Get status text based on time difference in seconds
  const getStatusText = (timeInSeconds) => {
    if (timeInSeconds <= THRESHOLDS.GOOD) {
      return 'Good';
    } else if (timeInSeconds <= THRESHOLDS.WARNING) {
      return 'Warning';
    } else {
      return 'Critical';
    }
  };

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

  // Get time difference in seconds for status calculation
  const getTimeDiffInSeconds = (timestamp) => {
    const buttonTime = new Date(timestamp);
    const diffMs = currentTime - buttonTime;
    return Math.floor(diffMs / 1000);
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

  // Get time difference between last two buttons in seconds
  const getLastTwoButtonsDiffInSeconds = () => {
    if (sortedButtonItems.length < 2) return 0;
    
    const lastButton = new Date(sortedButtonItems[0].timestamp);
    const secondLastButton = new Date(sortedButtonItems[1].timestamp);
    const diffMs = lastButton - secondLastButton;
    
    return Math.floor(diffMs / 1000);
  };

  // Calculate time difference between consecutive button presses
  const calculateTimeDiffFromPrevious = (currentIndex) => {
    if (currentIndex >= sortedButtonItems.length - 1) return 'N/A';
    
    const currentButton = new Date(sortedButtonItems[currentIndex].timestamp);
    const previousButton = new Date(sortedButtonItems[currentIndex + 1].timestamp);
    const diffMs = currentButton - previousButton;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Get time difference from previous in seconds
  const getTimeDiffFromPreviousInSeconds = (currentIndex) => {
    if (currentIndex >= sortedButtonItems.length - 1) return 0;
    
    const currentButton = new Date(sortedButtonItems[currentIndex].timestamp);
    const previousButton = new Date(sortedButtonItems[currentIndex + 1].timestamp);
    const diffMs = currentButton - previousButton;
    
    return Math.floor(diffMs / 1000);
  };

  const lastTwoButtonsDiff = calculateLastTwoButtonsDiff();
  const lastPressTimeInSeconds = sortedButtonItems.length > 0 ? getTimeDiffInSeconds(sortedButtonItems[0].timestamp) : 0;
  const lastTwoButtonsDiffInSeconds = getLastTwoButtonsDiffInSeconds();

  const lastPressStatus = getStatusColor(lastPressTimeInSeconds);
  const lastTwoButtonsStatus = getStatusColor(lastTwoButtonsDiffInSeconds);

  // Get status indicator component for time since last press
  const getStatusIndicator = (timeInSeconds) => {
    const statusText = getStatusText(timeInSeconds);
    
    if (timeInSeconds <= THRESHOLDS.GOOD) {
      return null; // No status indicator for good
    } else if (timeInSeconds <= THRESHOLDS.WARNING) {
      return (
        <div className="text-black font-medium text-sm mt-1 animate-pulse">
          ⚠️ {statusText}
        </div>
      );
    } else {
      return (
        <div className="text-black font-medium text-sm mt-1">
          🔴 {statusText}
        </div>
      );
    }
  };

  if (buttonItems.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔘 Silver In-Machine Age</h3>
        <p className="text-yellow-700">No button sensor data found.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">🔘 Silver In-Machine Age</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700">Total Button Presses</h4>
          <p className="text-2xl font-bold text-blue-600">{buttonItems.length}</p>
        </div>
        
        {sortedButtonItems.length > 0 && (
          <div className={`bg-white p-3 rounded border ${lastPressStatus.border}`}>
            <h4 className="font-medium text-gray-700">Time Since Last Press</h4>
            <p className={`text-2xl font-bold ${lastPressTimeInSeconds <= THRESHOLDS.GOOD ? 'text-green-600' : 'text-black'}`}>
              {calculateTimePassed(sortedButtonItems[0].timestamp)}
            </p>
            {getStatusIndicator(lastPressTimeInSeconds)}
          </div>
        )}
        
        {lastTwoButtonsDiff && (
          <div className={`bg-white p-3 rounded border md:col-span-2 ${lastTwoButtonsStatus.border}`}>
            <h4 className="font-medium text-gray-700">Time Between Last Two Presses</h4>
            <p className={`text-2xl font-bold ${lastTwoButtonsStatus.color}`}>{lastTwoButtonsDiff}</p>
          </div>
        )}
      </div>

      {/* Recent Button Presses Table */}
      <div className="bg-white rounded border overflow-hidden">
        <h4 className="font-medium text-gray-700 p-3 bg-gray-50 border-b">Recent Ink cartridge changes</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Timestamp</th>
                <th className="px-3 py-2 text-left">Time Since Previous</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedButtonItems.slice(0, 5).map((item, index) => {
                const timeSinceLastInSeconds = getTimeDiffInSeconds(item.timestamp);
                const timeSincePreviousInSeconds = getTimeDiffFromPreviousInSeconds(index);
                
                // For the most recent button (index 0), use age from current time
                // For older buttons, use time difference from previous button
                let statusTimeInSeconds, statusColor, statusText;
                
                if (index === 0) {
                  // Most recent button - use age (time since current time)
                  statusTimeInSeconds = timeSinceLastInSeconds;
                  statusColor = getStatusColor(statusTimeInSeconds);
                  statusText = getStatusText(statusTimeInSeconds);
                } else {
                  // Older buttons - use time difference from previous button
                  statusTimeInSeconds = timeSincePreviousInSeconds;
                  statusColor = getStatusColor(statusTimeInSeconds);
                  statusText = getStatusText(statusTimeInSeconds);
                }
                
                return (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-medium text-black">
                      {index === 0 ? calculateTimePassed(item.timestamp) : calculateTimeDiffFromPrevious(index)}
                    </td>
                    <td className={`px-3 py-2 font-medium ${statusColor.color}`}>
                      {index >= sortedButtonItems.length - 1 ? 'N/A' : statusText}
                    </td>
                  </tr>
                );
              })}
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