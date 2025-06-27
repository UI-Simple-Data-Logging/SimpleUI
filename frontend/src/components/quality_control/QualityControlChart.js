import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

const DECISION_COLORS = {
  'Yes': '#10b981',      // Green
  'No': '#ef4444',       // Red
  'Goes to Rework': '#f59e0b'  // Amber/Yellow
};

const REWORKED_COLORS = {
  'Yes': '#3b82f6',      // Blue
  'No': '#6b7280'        // Gray
};

const YIELD_COLORS = {
  'Yes': '#10b981',      // Green
  'No': '#ef4444'        // Red
};

const REWORK_SUCCESS_COLORS = {
  'Yes': '#10b981',      // Green
  'No': '#ef4444'        // Red
};

function QualityControlChart({ items, timeFilter, timeRange }) {
  // State for toggling between pass rate and defect rate
  const [showPassRate, setShowPassRate] = useState(false);
  // Memoize expensive calculations to improve performance
  const chartData = useMemo(() => {
    // Prepare decision data
    const decisionCounts = items.reduce((acc, item) => {
      const decision = item.decision || 'Unknown';
      acc[decision] = (acc[decision] || 0) + 1;
      return acc;
    }, {});    // Ensure consistent order: Pass, Fail, Goes to Rework
    const decisionOrder = ['Yes', 'No', 'Goes to Rework'];
    const decisionData = decisionOrder
      .filter(key => decisionCounts[key] > 0)
      .map(key => ({
        name: key === 'Yes' ? 'Pass' : key === 'No' ? 'Fail' : key, // Map Yes to Pass and No to Fail
        value: decisionCounts[key],
        color: DECISION_COLORS[key] || '#9ca3af'
      }));

    // Prepare reworked data (exclude N/A values)
    const reworkedCounts = items.reduce((acc, item) => {
      const reworked = item.reworked || 'No';
      // Only count Yes and No values, exclude N/A
      if (reworked === 'Yes' || reworked === 'No') {
        acc[reworked] = (acc[reworked] || 0) + 1;
      }
      return acc;
    }, {});    // Ensure consistent order: Yes, No
    const reworkedOrder = ['Yes', 'No'];
    const reworkedData = reworkedOrder
      .filter(key => reworkedCounts[key] > 0)
      .map(key => ({
        name: key,
        value: reworkedCounts[key],
        color: REWORKED_COLORS[key] || '#9ca3af'
      }));

    // Prepare yield data (only Yes and No from decision field)
    const yieldCounts = items.reduce((acc, item) => {
      const decision = item.decision;
      if (decision === 'Yes' || decision === 'No') {
        acc[decision] = (acc[decision] || 0) + 1;
      }
      return acc;
    }, {});    // Ensure consistent order: Pass, Fail
    const yieldOrder = ['Yes', 'No'];
    const yieldData = yieldOrder
      .filter(key => yieldCounts[key] > 0)
      .map(key => ({
        name: key === 'Yes' ? 'Pass' : 'Fail', // Map Yes to Pass and No to Fail
        value: yieldCounts[key],
        color: YIELD_COLORS[key] || '#9ca3af'
      }));

    // Prepare reworked success data (only records with Reworked = Yes, then their rework outcome)
    const reworkedItems = items.filter(item => item.reworked === 'Yes');
    const reworkedSuccessCounts = reworkedItems.reduce((acc, item) => {
      const outcome = item.reworkOutcome || item.decision; // Fallback to decision if reworkOutcome not available
      if (outcome === 'Yes' || outcome === 'No') {
        acc[outcome] = (acc[outcome] || 0) + 1;
      }
      return acc;
    }, {});    // Ensure consistent order: Success, Scrap
    const reworkedSuccessOrder = ['Yes', 'No'];
    const reworkedSuccessData = reworkedSuccessOrder
      .filter(key => reworkedSuccessCounts[key] > 0)
      .map(key => ({
        name: key === 'Yes' ? 'Success' : 'Scrap', // Map Yes to Success and No to Scrap
        value: reworkedSuccessCounts[key],
        color: REWORK_SUCCESS_COLORS[key] || '#9ca3af'
      }));

    return {
      decisionData,
      reworkedData,
      yieldData,
      reworkedSuccessData,
      reworkedItems
    };
  }, [items]);
  const { decisionData, reworkedData, yieldData, reworkedSuccessData } = chartData;

  // Prepare cause of failure data
  const causeOfFailureCounts = items.reduce((acc, item) => {
    if (item.causeOfFailure && Array.isArray(item.causeOfFailure)) {
      item.causeOfFailure.forEach(cause => {
        acc[cause] = (acc[cause] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const causeOfFailureData = Object.entries(causeOfFailureCounts)
    .map(([key, value]) => ({
      name: key,
      count: value
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Prepare failure classification data
  const affectedOutputCounts = items.reduce((acc, item) => {
    if (item.affectedOutput && Array.isArray(item.affectedOutput)) {
      item.affectedOutput.forEach(output => {
        acc[output] = (acc[output] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const affectedOutputData = Object.entries(affectedOutputCounts)
    .map(([key, value]) => ({
      name: key,
      count: value
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending  // Get all unique operators
  const allOperators = [...new Set(items.map(item => item.operator).filter(Boolean))];

  // Get all unique causes of failure
  const allCauses = [...new Set(items.flatMap(item => 
    item.causeOfFailure && Array.isArray(item.causeOfFailure) ? item.causeOfFailure : []
  ))];

  // Get all unique failure classifications
  const allOutputs = [...new Set(items.flatMap(item => 
    item.affectedOutput && Array.isArray(item.affectedOutput) ? item.affectedOutput : []
  ))];

  // Prepare cause of failure data by operator (grouped bar chart format)
  const causeOfFailureByOperatorData = allOperators.map(operator => {
    const operatorItems = items.filter(item => item.operator === operator);
    const operatorCauseCounts = operatorItems.reduce((acc, item) => {
      if (item.causeOfFailure && Array.isArray(item.causeOfFailure)) {
        item.causeOfFailure.forEach(cause => {
          acc[cause] = (acc[cause] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const dataPoint = { operator: operator };
    allCauses.forEach(cause => {
      dataPoint[cause] = operatorCauseCounts[cause] || 0;
    });
    return dataPoint;
  });

  // Prepare failure classification data by operator (grouped bar chart format)
  const affectedOutputByOperatorData = allOperators.map(operator => {
    const operatorItems = items.filter(item => item.operator === operator);
    const operatorOutputCounts = operatorItems.reduce((acc, item) => {
      if (item.affectedOutput && Array.isArray(item.affectedOutput)) {
        item.affectedOutput.forEach(output => {
          acc[output] = (acc[output] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const dataPoint = { operator: operator };
    allOutputs.forEach(output => {
      dataPoint[output] = operatorOutputCounts[output] || 0;
    });
    return dataPoint;
  });
  // Define colors for different causes/outputs
  const CHART_COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#14b8a6', // Teal
  ];

  // Prepare defect rate vs speed data
  const speedDefectData = items
    .filter(item => item.speed && item.speed.value && item.decision)
    .map(item => ({
      speed: parseFloat(item.speed.value),
      isDefect: item.decision === 'No' || item.decision === 'Goes to Rework' ? 1 : 0
    }))
    .sort((a, b) => a.speed - b.speed);

  // Group by speed ranges and calculate defect rate
  const speedRanges = {};
  speedDefectData.forEach(item => {
    const speedRange = Math.floor(item.speed / 2) * 2; // Group by 2 mm/s ranges
    if (!speedRanges[speedRange]) {
      speedRanges[speedRange] = { total: 0, defects: 0 };
    }
    speedRanges[speedRange].total++;
    speedRanges[speedRange].defects += item.isDefect;
  });
  const speedDefectRateData = Object.entries(speedRanges)
    .map(([speed, data]) => ({
      speed: parseFloat(speed),
      defectRate: data.total > 0 ? (data.defects / data.total) * 100 : 0,
      passRate: data.total > 0 ? ((data.total - data.defects) / data.total) * 100 : 0,
      totalSamples: data.total
    }))
    .filter(item => item.totalSamples >= 2) // Only include ranges with at least 2 samples
    .sort((a, b) => a.speed - b.speed);

  // Prepare defect rate vs temperature data
  const temperatureDefectData = items
    .filter(item => item.temperature && item.temperature.value && item.decision)
    .map(item => ({
      temperature: parseFloat(item.temperature.value),
      isDefect: item.decision === 'No' || item.decision === 'Goes to Rework' ? 1 : 0
    }))
    .sort((a, b) => a.temperature - b.temperature);

  // Group by temperature ranges and calculate defect rate
  const temperatureRanges = {};
  temperatureDefectData.forEach(item => {
    const tempRange = Math.floor(item.temperature); // Group by 1°C ranges
    if (!temperatureRanges[tempRange]) {
      temperatureRanges[tempRange] = { total: 0, defects: 0 };
    }
    temperatureRanges[tempRange].total++;
    temperatureRanges[tempRange].defects += item.isDefect;
  });  const temperatureDefectRateData = Object.entries(temperatureRanges)
    .map(([temp, data]) => ({
      temperature: parseFloat(temp),
      defectRate: data.total > 0 ? (data.defects / data.total) * 100 : 0,
      passRate: data.total > 0 ? ((data.total - data.defects) / data.total) * 100 : 0,
      totalSamples: data.total
    }))
    .filter(item => item.totalSamples >= 2) // Only include ranges with at least 2 samples
    .sort((a, b) => a.temperature - b.temperature);
  // Prepare heatmap data (Temperature vs Speed)
  const heatmapData = items
    .filter(item => 
      item.temperature && item.temperature.value && 
      item.speed && item.speed.value && 
      item.decision
    )
    .map(item => ({
      temperature: Math.floor(parseFloat(item.temperature.value)),
      speed: Math.floor(parseFloat(item.speed.value) / 2) * 2, // Group by 2 mm/s ranges
      isDefect: item.decision === 'No' || item.decision === 'Goes to Rework' ? 1 : 0
    }));

  // Group by temperature and speed ranges for heatmap
  const heatmapRanges = {};
  heatmapData.forEach(item => {
    const key = `${item.temperature}-${item.speed}`;
    if (!heatmapRanges[key]) {
      heatmapRanges[key] = { 
        temperature: item.temperature, 
        speed: item.speed, 
        total: 0, 
        defects: 0 
      };
    }
    heatmapRanges[key].total++;
    heatmapRanges[key].defects += item.isDefect;
  });  // Memoize binned data calculations for better performance
  const binnedAnalysisData = useMemo(() => {
    const createBinnedData = (items, field, binSize) => {
      const filteredItems = items.filter(item => 
        item[field] && item[field].value && item.decision
      );
      
      if (filteredItems.length === 0) return [];
      
      const values = filteredItems.map(item => parseFloat(item[field].value));
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal;
      
      // If range is too small or there's only one unique value, return single bin
      if (range === 0) {
        return [{
          bin: `${minVal.toFixed(1)}`,
          binStart: minVal,
          defectRate: (filteredItems.filter(item => item.decision === 'No' || item.decision === 'Goes to Rework').length / filteredItems.length) * 100,
          passRate: (filteredItems.filter(item => item.decision === 'Yes').length / filteredItems.length) * 100,
          totalSamples: filteredItems.length
        }];
      }
      
      // Adjust bin size if it's too large for the data range
      let adjustedBinSize = binSize;
      if (range < binSize) {
        adjustedBinSize = range / 5; // Create 5 bins for small ranges
      }
      
      const bins = {};
      
      filteredItems.forEach(item => {
        const value = parseFloat(item[field].value);
        const binStart = Math.floor((value - minVal) / adjustedBinSize) * adjustedBinSize + minVal;
        const binEnd = binStart + adjustedBinSize;
        const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
        
        if (!bins[binLabel]) {
          bins[binLabel] = { total: 0, defects: 0, binStart: binStart };
        }
        bins[binLabel].total++;
        if (item.decision === 'No' || item.decision === 'Goes to Rework') {
          bins[binLabel].defects++;
        }
      });
      
      return Object.entries(bins)
        .map(([label, data]) => ({
          bin: label,
          binStart: data.binStart,
          defectRate: (data.defects / data.total) * 100,
          passRate: ((data.total - data.defects) / data.total) * 100,
          totalSamples: data.total
        }))
        .filter(item => item.totalSamples >= 2)
        .sort((a, b) => a.binStart - b.binStart);
    };

    return {
      temperatureBinData: createBinnedData(items, 'temperature', 2), // 2°C bins
      speedBinData: createBinnedData(items, 'speed', 5), // 5 mm/s bins
      squeegeeSpeedBinData: createBinnedData(items, 'squeegeeSpeed', 5), // 5 mm/s bins
      printPressureBinData: createBinnedData(items, 'printPressure', 10), // 10 N/m² bins
      inkViscosityBinData: createBinnedData(items, 'inkViscosity', 2), // 2 cP bins
      humidityBinData: createBinnedData(items, 'humidity', 5) // 5% bins
    };  }, [items]);
  const { temperatureBinData, speedBinData, squeegeeSpeedBinData, printPressureBinData, inkViscosityBinData, humidityBinData } = binnedAnalysisData;

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = items.length > 0 ? ((data.value / items.length) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomReworkedTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      // Calculate percentage based on reworked items only (excluding N/A)
      const totalReworkedItems = reworkedData.reduce((sum, item) => sum + item.value, 0);
      const percentage = totalReworkedItems > 0 ? ((data.value / totalReworkedItems) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomYieldTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const totalYieldItems = yieldData.reduce((sum, item) => sum + item.value, 0);
      const percentage = totalYieldItems > 0 ? ((data.value / totalYieldItems) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomReworkSuccessTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const totalReworkItems = reworkedSuccessData.reduce((sum, item) => sum + item.value, 0);
      const percentage = totalReworkItems > 0 ? ((data.value / totalReworkItems) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rateType = showPassRate ? 'Pass Rate' : 'Defect Rate';
      const rateValue = showPassRate ? data.passRate : data.defectRate;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            {rateType}: <span className="font-medium">{rateValue.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Samples: <span className="font-medium">{data.totalSamples}</span>
          </p>
        </div>
      );
    }
    return null;
  };  const CustomBinnedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rateType = showPassRate ? 'Pass Rate' : 'Defect Rate';
      const rateValue = showPassRate ? data.passRate : data.defectRate;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">Range: {label}</p>
          <p className="text-sm text-gray-600">
            {rateType}: <span className="font-medium">{rateValue.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Samples: <span className="font-medium">{data.totalSamples}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  // Custom tick formatter for long labels
  const formatTick = (value) => {
    if (value.length > 15) {
      return value.substring(0, 15) + '...';
    }
    return value;
  };

  // Function to calculate percentage
  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const calculateYieldPercentage = (value) => {
    const totalYieldItems = yieldData.reduce((sum, item) => sum + item.value, 0);
    return totalYieldItems > 0 ? ((value / totalYieldItems) * 100).toFixed(1) : 0;
  };

  const calculateReworkSuccessPercentage = (value) => {
    const totalReworkItems = reworkedSuccessData.reduce((sum, item) => sum + item.value, 0);
    return totalReworkItems > 0 ? ((value / totalReworkItems) * 100).toFixed(1) : 0;
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Quality Control Analytics</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          {timeFilter && timeFilter !== 'all' 
            ? `No quality control data available for the selected time range (${timeRange}).`
            : 'No data available for charts'
          }
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with Filter Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">📊 Quality Control Analytics</h3>
          {timeFilter && timeFilter !== 'all' && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
              📊 {timeRange} ({items.length} records)
            </div>
          )}
        </div>
        {timeFilter && timeFilter !== 'all' && (
          <p className="text-sm text-gray-500">
            Analytics based on quality control data from {timeRange.toLowerCase()}.
          </p>
        )}
      </div>
      
      {/* Top Row - Yield and Reworked Success Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Yield Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Yield</h4>
          {yieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={yieldData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {yieldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomYieldTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({calculateYieldPercentage(entry.payload.value)}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No yield data available
            </div>
          )}
        </div>

        {/* Reworked Success Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Reworked Success Rate</h4>
          {reworkedSuccessData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reworkedSuccessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {reworkedSuccessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomReworkSuccessTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({calculateReworkSuccessPercentage(entry.payload.value)}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No reworked items available
            </div>
          )}
        </div>
      </div>

      {/* Second Row - Original Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Decision Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Decision Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={decisionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {decisionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({calculatePercentage(entry.payload.value, items.length)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>        {/* Reworked Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Reworked Distribution</h4>
          {reworkedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reworkedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {reworkedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomReworkedTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => {
                    const totalReworkedItems = reworkedData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = totalReworkedItems > 0 ? ((entry.payload.value / totalReworkedItems) * 100).toFixed(1) : 0;
                    return (
                      <span style={{ color: entry.color }}>
                        {value} ({percentage}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No reworked data available
            </div>
          )}
        </div>
      </div>

      {/* Bar Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cause of Failure Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Cause of Failure Distribution</h4>
          {causeOfFailureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={causeOfFailureData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatTick}
                />
                <YAxis />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No cause of failure data available
            </div>
          )}
        </div>

        {/* Failure Classification Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Failure Classification Distribution</h4>
          {affectedOutputData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={affectedOutputData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatTick}
                />
                <YAxis />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No failure classification data available
            </div>
          )}        </div>
      </div>      {/* New Charts Row - Operator-Based Analysis */}
      {/* Cause of Failure Distribution by Operator */}
      <div className="mt-8">
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Cause of Failure by Operator</h4>
          {causeOfFailureByOperatorData.length > 0 && allCauses.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={causeOfFailureByOperatorData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="operator" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {allCauses.map((cause, index) => (
                  <Bar 
                    key={cause} 
                    dataKey={cause} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    name={cause}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No cause of failure data by operator available
            </div>
          )}
        </div>
      </div>

      {/* Failure Classification Distribution by Operator */}
      <div className="mt-8">
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Failure Classification by Operator</h4>
          {affectedOutputByOperatorData.length > 0 && allOutputs.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={affectedOutputByOperatorData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="operator" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {allOutputs.map((output, index) => (
                  <Bar 
                    key={output} 
                    dataKey={output} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    name={output}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No failure classification data by operator available
            </div>
          )}        </div>
      </div>
        {/* Line Charts Row - Defect Rate Analysis */}
      <div className="mt-8">
        {/* Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowPassRate(false)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                !showPassRate
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Defect Rate
            </button>
            <button
              onClick={() => setShowPassRate(true)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                showPassRate
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Pass Rate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rate vs Speed */}
          <div>
            <h4 className="text-md font-medium mb-2 text-center">
              {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Speed
            </h4>
            {speedDefectRateData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={speedDefectRateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="speed" 
                    label={{ value: 'Speed (mm/s)', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    stroke={showPassRate ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    dot={{ fill: showPassRate ? "#10b981" : "#ef4444", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No speed data available for {showPassRate ? 'pass rate' : 'defect rate'} analysis
              </div>
            )}
          </div>

          {/* Rate vs Temperature */}
          <div>
            <h4 className="text-md font-medium mb-2 text-center">
              {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Temperature
            </h4>
            {temperatureDefectRateData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={temperatureDefectRateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="temperature" 
                    label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    stroke={showPassRate ? "#10b981" : "#3b82f6"}
                    strokeWidth={2}
                    dot={{ fill: showPassRate ? "#10b981" : "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No temperature data available for {showPassRate ? 'pass rate' : 'defect rate'} analysis
              </div>
            )}          </div>
        </div>
      </div>      {/* Parameter Analysis Row */}
      <div className="mt-8">
        <h4 className="text-lg font-medium mb-6 text-center">
          Parameter Binned Analysis
        </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Temperature Binned Analysis */}
          <div>
            <h5 className="text-md font-medium mb-2 text-center">
              {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Temperature Ranges
            </h5>
            {temperatureBinData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={temperatureBinData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    label={{ value: 'Temperature Range (°C)', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomBinnedTooltip />} />
                  <Bar 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    fill={showPassRate ? "#10b981" : "#ef4444"}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No temperature data available for binned analysis
              </div>
            )}
          </div>

          {/* Speed Binned Analysis */}
          <div>
            <h5 className="text-md font-medium mb-2 text-center">
              {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Speed Ranges
            </h5>
            {speedBinData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={speedBinData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    label={{ value: 'Speed Range (mm/s)', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomBinnedTooltip />} />
                  <Bar 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    fill={showPassRate ? "#10b981" : "#3b82f6"}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (              <div className="flex items-center justify-center h-64 text-gray-500">
                No speed data available for binned analysis
              </div>
            )}
          </div>

          {/* Squeegee Speed Binned Analysis */}
          {squeegeeSpeedBinData.length > 0 && (
            <div>
              <h5 className="text-md font-medium mb-2 text-center">
                {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Squeegee Speed
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={squeegeeSpeedBinData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomBinnedTooltip />} />
                  <Bar 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    fill={showPassRate ? "#10b981" : "#8b5cf6"}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Print Pressure Binned Analysis */}
          {printPressureBinData.length > 0 && (
            <div>
              <h5 className="text-md font-medium mb-2 text-center">
                {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Print Pressure
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={printPressureBinData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomBinnedTooltip />} />
                  <Bar 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    fill={showPassRate ? "#10b981" : "#f97316"}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Ink Viscosity Binned Analysis */}
          {inkViscosityBinData.length > 0 && (
            <div>
              <h5 className="text-md font-medium mb-2 text-center">
                {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Ink Viscosity
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={inkViscosityBinData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomBinnedTooltip />} />
                  <Bar 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    fill={showPassRate ? "#10b981" : "#06b6d4"}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Humidity Binned Analysis */}
          {humidityBinData.length > 0 && (
            <div>
              <h5 className="text-md font-medium mb-2 text-center">
                {showPassRate ? 'Pass Rate' : 'Defect Rate'} vs Humidity
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={humidityBinData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    label={{ 
                      value: `${showPassRate ? 'Pass Rate' : 'Defect Rate'} (%)`, 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomBinnedTooltip />} />
                  <Bar 
                    dataKey={showPassRate ? "passRate" : "defectRate"}
                    fill={showPassRate ? "#10b981" : "#14b8a6"}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}        </div>
      </div>
      
      {/* <div className="mt-6 text-sm text-gray-600 text-center">
        Total Records: {items.length} | Yield Records: {yieldData.reduce((sum, item) => sum + item.value, 0)} | Reworked Items: {reworkedItems.length}
      </div> */}
    </div>
  );
}

export default QualityControlChart;