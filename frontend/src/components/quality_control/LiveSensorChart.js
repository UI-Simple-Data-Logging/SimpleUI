import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportToCSV = () => {
    if (!items || items.length === 0) {
      toast.error('No data available to export');
      return;
    }

    const dataToExport = items
      .filter(item =>
        item.temperature?.value &&
        item.speed?.value &&
        item.timestamp
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxDataPoints)
      .reverse();

    if (dataToExport.length === 0) {
      toast.error('No valid data to export');
      return;
    }

    const headers = ['Timestamp', 'Temperature (°C)', 'Speed (mm/s)', 'Squeegee Speed (mm/s)', 'Print Pressure (N/m²)', 'Ink Viscosity (cP)', 'Alerts'];
    
    const csvData = dataToExport.map(item => {
      const timestamp = new Date(item.timestamp).toLocaleString();
      const temp = item.temperature?.value || '';
      const speed = item.speed?.value || '';
      const squeegeeSpeed = item.squeegeeSpeed?.value || '';
      const printPressure = item.printPressure?.value || '';
      const inkViscosity = item.inkViscosity?.value || '';
      
      // Check for alerts for this record
      const alerts = [];
      Object.entries(thresholds).forEach(([sensor, threshold]) => {
        let value = null;
        switch(sensor) {
          case 'temperature': value = parseFloat(temp); break;
          case 'speed': value = parseFloat(speed); break;
          case 'squeegeeSpeed': value = parseFloat(squeegeeSpeed); break;
          case 'printPressure': value = parseFloat(printPressure); break;
          case 'inkViscosity': value = parseFloat(inkViscosity); break;
          default: value = null; break;
        }
        if (value && (value < threshold.min || value > threshold.max)) {
          alerts.push(`${sensor}: ${value}`);
        }
      });
      
      return [timestamp, temp, speed, squeegeeSpeed, printPressure, inkViscosity, alerts.join('; ')];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `sensor_data_${new Date().toISOString().split('T')[0]}_${maxDataPoints}records.csv`);
    
    toast.success('Exported as CSV');
  };

  const exportToPDF = () => {
    if (!violations || violations.length === 0) {
      toast.error('No alerts available to export');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Sensor Alerts Report', 14, 15);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Total Alerts: ${violations.length} | Data Points Analyzed: ${maxDataPoints}`, 14, 32);

    const tableData = violations.slice().reverse().map((violation, index) => {
      const sensor = violation.sensor.replace(/([A-Z])/g, ' $1').trim();
      const unit = SENSOR_RANGES[violation.sensor]?.unit || '';
      const minThreshold = thresholds[violation.sensor]?.min || '';
      const maxThreshold = thresholds[violation.sensor]?.max || '';
      const status = violation.value < minThreshold ? 'Below Minimum' : 'Above Maximum';
      
      return [
        index + 1,
        sensor,
        `${violation.value} ${unit}`,
        `${minThreshold} - ${maxThreshold} ${unit}`,
        status,
        violation.formattedTime
      ];
    });

    autoTable(doc, {
      head: [['Alert #', 'Sensor', 'Value', 'Expected Range', 'Status', 'Timestamp']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [64, 64, 64] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
        5: { cellWidth: 45 }
      }
    });

    doc.save(`sensor_alerts_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('Exported as PDF');
  };

  const exportToExcel = () => {
    if (!violations || violations.length === 0) {
      toast.error('No alerts available to export');
      return;
    }

    const worksheetData = violations.slice().reverse().map((violation, index) => {
      const sensor = violation.sensor.replace(/([A-Z])/g, ' $1').trim();
      const unit = SENSOR_RANGES[violation.sensor]?.unit || '';
      const minThreshold = thresholds[violation.sensor]?.min || '';
      const maxThreshold = thresholds[violation.sensor]?.max || '';
      const status = violation.value < minThreshold ? 'Below Minimum' : 'Above Maximum';
      
      return {
        'Alert #': index + 1,
        'Sensor': sensor,
        'Value': violation.value,
        'Unit': unit,
        'Min Threshold': minThreshold,
        'Max Threshold': maxThreshold,
        'Status': status,
        'Timestamp': violation.formattedTime
      };
    });
    
    // Add metadata at the top
    const metaData = [
      ['SENSOR ALERTS REPORT'],
      ['Generated:', new Date().toLocaleString()],
      ['Total Alerts:', violations.length],
      ['Data Points Analyzed:', maxDataPoints],
      [] // Empty row
    ];
    
    // Create a new worksheet with metadata
    const metaWorksheet = XLSX.utils.aoa_to_sheet(metaData);
    XLSX.utils.sheet_add_json(metaWorksheet, worksheetData, { origin: 'A6', skipHeader: false });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, metaWorksheet, 'Sensor Alerts');
    XLSX.writeFile(workbook, `sensor_alerts_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Exported as Excel');
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
          timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
                timestamp: fullTimestamp,
                formattedTime: timestamp.toLocaleString()
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-lg font-semibold">📊 Live Sensor Data</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              📥 CSV ({maxDataPoints} records)
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={violations.length === 0}
              title={violations.length === 0 ? "No alerts to export" : "Export alerts as PDF"}
            >
              📄 PDF Alerts ({violations.length})
            </button>
            <button
              onClick={exportToExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={violations.length === 0}
              title={violations.length === 0 ? "No alerts to export" : "Export alerts as Excel file"}
            >
              📊 Excel Alerts ({violations.length})
            </button>
          </div>
          <div className="flex items-center space-x-2">
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

      <div className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={600}>
          <LineChart
            data={chartData}
            margin={{ top: 60, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              interval="preserveStartEnd"
              tick={{ fontSize: 11 }}
              tickMargin={10}
            />
            <YAxis domain={[-600, 100]} tickFormatter={formatYTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => {
                const sensor = value;
                const config = SENSOR_RANGES[sensor];
                return <span style={{ color: config?.color }}>{sensor.charAt(0).toUpperCase() + sensor.slice(1)}</span>;
              }}
            />

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
      </div>

      {violations.length > 0 && (
        <div className="mt-6">
          <div className="mb-3">
            <h4 className="text-md font-semibold text-red-700">⚠️ Recent Alerts</h4>
            <span className="text-sm text-gray-500">
              Showing last 5 of {violations.length} total alerts
            </span>
          </div>
          <div className="bg-red-50 border border-red-300 rounded-lg overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {violations.slice(-5).reverse().map((violation, index) => (
                <div 
                  key={index} 
                  className={`p-3 border-b border-red-200 last:border-b-0 ${
                    index === 0 ? 'bg-red-100' : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-red-800 capitalize">
                        {violation.sensor.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-red-700">
                        Value: <span className="font-semibold">{violation.value}</span>
                        {SENSOR_RANGES[violation.sensor]?.unit && ` ${SENSOR_RANGES[violation.sensor].unit}`}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Expected: {thresholds[violation.sensor]?.min} - {thresholds[violation.sensor]?.max}
                        {SENSOR_RANGES[violation.sensor]?.unit && ` ${SENSOR_RANGES[violation.sensor].unit}`}
                      </div>
                    </div>
                    <div className="text-xs text-red-600 text-right ml-4">
                      {violation.formattedTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {violations.length > 5 && (
              <div className="p-2 bg-red-100 text-center text-sm text-red-700">
                {violations.length - 5} more alerts not shown
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveSensorChart;
