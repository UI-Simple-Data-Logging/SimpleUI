import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Y-axis ranges for different sensors (normalized for display)
const SENSOR_RANGES = {
  temperature: { min: 0, max: 100, unit: '°C', color: '#ef4444', offset: 0 },
  speed: { min: -100, max: 0, unit: 'mm/s', color: '#3b82f6', offset: -100 },
  squeegeeSpeed: { min: -200, max: -100, unit: 'mm/s', color: '#10b981', offset: -200 },
  printPressure: { min: -300, max: -200, unit: 'N/m²', color: '#f59e0b', offset: -300 },
  inkViscosity: { min: -400, max: -300, unit: 'cP', color: '#8b5cf6', offset: -400 }
};

function LiveSensorChart({ items }) {
  const [isLive, setIsLive] = useState(false);
  const [maxDataPoints, setMaxDataPoints] = useState(50);

  // Prepare chart data with normalized sensor values
  const chartData = useMemo(() => {
    if (!items || items.length === 0) return [];

    return items
      .filter(item => 
        item.temperature?.value && 
        item.speed?.value && 
        item.timestamp
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Chronological order
      .slice(-maxDataPoints) // Take the most recent data points
      .map(item => {
        const timestamp = new Date(item.timestamp);
        
        // Normalize sensor values to their display ranges
        const normalizeValue = (value, sensor) => {
          const range = SENSOR_RANGES[sensor];
          if (!range) return null;
          
          // Get the actual range of the sensor
          let actualMin, actualMax;
          switch(sensor) {
            case 'temperature':
              actualMin = 20; actualMax = 50; // °C
              break;
            case 'speed':
              actualMin = 25; actualMax = 55; // mm/s
              break;
            case 'squeegeeSpeed':
              actualMin = 15; actualMax = 45; // mm/s
              break;
            case 'printPressure':
              actualMin = 7000; actualMax = 13000; // N/m²
              break;
            case 'inkViscosity':
              actualMin = 10; actualMax = 30; // cP
              break;
            default:
              return null;
          }
          
          // Normalize to 0-100 range, then apply offset
          const normalized = ((value - actualMin) / (actualMax - actualMin)) * 100;
          return range.offset + Math.max(0, Math.min(100, normalized));
        };

        return {
          timestamp: timestamp.toLocaleTimeString(),
          fullTimestamp: timestamp.toISOString(),
          temperature: normalizeValue(parseFloat(item.temperature.value), 'temperature'),
          speed: normalizeValue(parseFloat(item.speed.value), 'speed'),
          squeegeeSpeed: item.squeegeeSpeed?.value ? 
            normalizeValue(parseFloat(item.squeegeeSpeed.value), 'squeegeeSpeed') : null,
          printPressure: item.printPressure?.value ? 
            normalizeValue(parseFloat(item.printPressure.value), 'printPressure') : null,
          inkViscosity: item.inkViscosity?.value ? 
            normalizeValue(parseFloat(item.inkViscosity.value), 'inkViscosity') : null,
          // Store original values for tooltip
          original: {
            temperature: parseFloat(item.temperature.value),
            speed: parseFloat(item.speed.value),
            squeegeeSpeed: item.squeegeeSpeed?.value ? parseFloat(item.squeegeeSpeed.value) : null,
            printPressure: item.printPressure?.value ? parseFloat(item.printPressure.value) : null,
            inkViscosity: item.inkViscosity?.value ? parseFloat(item.inkViscosity.value) : null
          }
        };
      });
  }, [items, maxDataPoints]);

  // Auto-refresh when live mode is enabled
  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        // Force a re-render to get latest data
        // In a real application, you might want to fetch new data here
      }, 2000); // Refresh every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-medium text-gray-800 mb-2">Time: {label}</p>
          <div className="space-y-1">
            {Object.entries(SENSOR_RANGES).map(([sensor, config]) => {
              const originalValue = data.original[sensor];
              if (originalValue !== null && originalValue !== undefined) {
                return (
                  <div key={sensor} className="text-sm" style={{ color: config.color }}>
                    <span className="font-medium">
                      {sensor.charAt(0).toUpperCase() + sensor.slice(1).replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="ml-2">{originalValue} {config.unit}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick formatter
  const formatYTick = (value) => {
    // Find which sensor range this value belongs to
    for (const [sensor, range] of Object.entries(SENSOR_RANGES)) {
      if (value >= range.offset && value <= range.offset + 100) {
        return `${sensor.charAt(0).toUpperCase()}`;
      }
    }
    return '';
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">📊 Live Sensor Data</h3>
          <div className="text-sm text-gray-500">
            No sensor data available
          </div>
        </div>
        <div className="flex items-center justify-center h-96 text-gray-500">
          <div className="text-center">
            <p>No sensor readings found</p>
            <p className="text-sm mt-2">Run the sensor data generator to see live data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">📊 Live Sensor Data</h3>
        <div className="flex items-center space-x-4">
          {/* Data points selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Points:</label>
            <select 
              value={maxDataPoints} 
              onChange={(e) => setMaxDataPoints(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          
          {/* Live mode toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
              isLive
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isLive ? '🔴 Live' : '⏸️ Paused'}
          </button>
        </div>
      </div>

      {/* Sensor Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          {Object.entries(SENSOR_RANGES).map(([sensor, config]) => (
            <div key={sensor} className="flex items-center">
              <div 
                className="w-3 h-3 rounded mr-2" 
                style={{ backgroundColor: config.color }}
              ></div>
              <span className="text-gray-700">
                {sensor.charAt(0).toUpperCase() + sensor.slice(1).replace(/([A-Z])/g, ' $1')} ({config.unit})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={500}>
        <LineChart 
          data={chartData} 
          isAnimationActive={false}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[-400, 100]}
            tick={{ fontSize: 10 }}
            tickFormatter={formatYTick}
            label={{ 
              value: 'Sensor Ranges', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Temperature Line */}
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke={SENSOR_RANGES.temperature.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
          
          {/* Speed Line */}
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke={SENSOR_RANGES.speed.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
          
          {/* Squeegee Speed Line */}
          {chartData.some(d => d.squeegeeSpeed !== null) && (
            <Line 
              type="monotone" 
              dataKey="squeegeeSpeed" 
              stroke={SENSOR_RANGES.squeegeeSpeed.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          )}
          
          {/* Print Pressure Line */}
          {chartData.some(d => d.printPressure !== null) && (
            <Line 
              type="monotone" 
              dataKey="printPressure" 
              stroke={SENSOR_RANGES.printPressure.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          )}
          
          {/* Ink Viscosity Line */}
          {chartData.some(d => d.inkViscosity !== null) && (
            <Line 
              type="monotone" 
              dataKey="inkViscosity" 
              stroke={SENSOR_RANGES.inkViscosity.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Status Information */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {chartData.length} data points
          {isLive && <span className="ml-2 text-green-600">• Auto-refreshing</span>}
        </div>
        <div>
          Last update: {chartData.length > 0 ? 
            new Date(chartData[chartData.length - 1].fullTimestamp).toLocaleString() : 
            'No data'
          }
        </div>
      </div>
    </div>
  );
}

export default LiveSensorChart;
