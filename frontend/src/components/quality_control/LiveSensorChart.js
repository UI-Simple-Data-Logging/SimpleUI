import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const SENSOR_RANGES = {
  temperature: { min: 0, max: 100, unit: '°C', color: '#ef4444', offset: 0 },
  speed: { min: -150, max: -50, unit: 'mm/s', color: '#3b82f6', offset: -150 },
  squeegeeSpeed: { min: -300, max: -200, unit: 'mm/s', color: '#10b981', offset: -300 },
  printPressure: { min: -450, max: -350, unit: 'N/m²', color: '#f59e0b', offset: -450 },
  inkViscosity: { min: -600, max: -500, unit: 'cP', color: '#8b5cf6', offset: -600 }
};

const DEFAULT_THRESHOLDS = {
  temperature: { min: 25, max: 45 },
  speed: { min: 30, max: 50 },
  squeegeeSpeed: { min: 20, max: 40 },
  printPressure: { min: 8000, max: 12000 },
  inkViscosity: { min: 12, max: 28 }
};

function LiveSensorChart({ items }) {
  const [maxDataPoints, setMaxDataPoints] = useState(50);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [violations, setViolations] = useState([]);

  const handleThresholdChange = (sensor, type, value) => {
    setThresholds(prev => ({
      ...prev,
      [sensor]: {
        ...prev[sensor],
        [type]: parseFloat(value)
      }
    }));
  };

  const chartData = useMemo(() => {
    const newViolations = [];

    if (!items || items.length === 0) return [];

    const normalized = items
      .filter(item =>
        item.temperature?.value &&
        item.speed?.value &&
        item.timestamp
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-maxDataPoints)
      .map(item => {
        const timestamp = new Date(item.timestamp);
        const fullTimestamp = timestamp.toISOString();

        const checkViolation = (sensor, value) => {
          if (!thresholds[sensor]) return false;
          return value < thresholds[sensor].min || value > thresholds[sensor].max;
        };

        const normalizeValue = (value, sensor) => {
          const range = SENSOR_RANGES[sensor];
          if (!range) return null;

          let actualMin, actualMax;
          switch (sensor) {
            case 'temperature': actualMin = 20; actualMax = 50; break;
            case 'speed': actualMin = 25; actualMax = 55; break;
            case 'squeegeeSpeed': actualMin = 15; actualMax = 45; break;
            case 'printPressure': actualMin = 7000; actualMax = 13000; break;
            case 'inkViscosity': actualMin = 10; actualMax = 30; break;
            default: return null;
          }

          const normalized = ((value - actualMin) / (actualMax - actualMin)) * 100;
          return range.offset + Math.max(0, Math.min(100, normalized));
        };

        const values = {
          temperature: parseFloat(item.temperature.value),
          speed: parseFloat(item.speed.value),
          squeegeeSpeed: item.squeegeeSpeed?.value ? parseFloat(item.squeegeeSpeed.value) : null,
          printPressure: item.printPressure?.value ? parseFloat(item.printPressure.value) : null,
          inkViscosity: item.inkViscosity?.value ? parseFloat(item.inkViscosity.value) : null
        };

        const dataPoint = {
          timestamp: timestamp.toLocaleTimeString(),
          fullTimestamp,
          original: values
        };

        for (const sensor in values) {
          if (values[sensor] !== null) {
            const norm = normalizeValue(values[sensor], sensor);
            dataPoint[sensor] = norm;

            if (checkViolation(sensor, values[sensor])) {
              newViolations.push({
                sensor,
                value: values[sensor],
                timestamp: fullTimestamp
              });
            }
          }
        }

        return dataPoint;
      });

    setViolations(newViolations);
    return normalized;
  }, [items, maxDataPoints, thresholds]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-medium text-gray-800 mb-2">Time: {label}</p>
          <div className="space-y-1">
            {Object.entries(SENSOR_RANGES).map(([sensor, config]) => {
              const val = data.original[sensor];
              if (val !== null && val !== undefined) {
                return (
                  <div key={sensor} style={{ color: config.color }}>
                    <strong>{sensor}: </strong>{val} {config.unit}
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

  const formatYTick = (value) => {
    for (const [sensor, range] of Object.entries(SENSOR_RANGES)) {
      if (value >= range.offset && value <= range.offset + 100) {
        return `${sensor[0].toUpperCase()}`;
      }
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">📊 Live Sensor Data</h3>
        <div className="flex items-center space-x-4">
          <label className="text-sm">Points:</label>
          <select
            value={maxDataPoints}
            onChange={(e) => setMaxDataPoints(parseInt(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            {[25, 50, 100, 200].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(thresholds).map(([sensor, range]) => (
          <div key={sensor} className="space-y-1">
            <label className="font-medium text-sm">{sensor.toUpperCase()} Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={range.min}
                onChange={e => handleThresholdChange(sensor, 'min', e.target.value)}
                className="w-1/2 border px-2 py-1 text-sm"
                placeholder="Min"
              />
              <input
                type="number"
                value={range.max}
                onChange={e => handleThresholdChange(sensor, 'max', e.target.value)}
                className="w-1/2 border px-2 py-1 text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" angle={-45} height={60} />
          <YAxis domain={[-600, 100]} tickFormatter={formatYTick} />
          <Tooltip content={<CustomTooltip />} />

          {Object.entries(SENSOR_RANGES).map(([sensor, config]) =>
            chartData.some(d => d[sensor] !== null) ? (
              <Line
                key={sensor}
                type="monotone"
                dataKey={sensor}
                stroke={config.color}
                strokeWidth={2}
                isAnimationActive={false}
                dot={({ cx, cy, payload }) => {
                  const value = payload.original[sensor];
                  const limit = thresholds[sensor];
                  if (value !== null && limit && (value < limit.min || value > limit.max)) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="red"
                        stroke="black"
                        strokeWidth={1}
                      />
                    );
                  }
                  return null;
                }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>

      {violations.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded text-sm text-red-700">
          <strong>⚠️ Alerts:</strong> Out-of-range values detected:
          <ul className="mt-2 list-disc list-inside">
            {violations.map((v, i) => (
              <li key={i}>{v.sensor} = {v.value} at {new Date(v.timestamp).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LiveSensorChart;
