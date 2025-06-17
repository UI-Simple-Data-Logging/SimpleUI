import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
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

function QualityControlChart({ items }) {
  // Prepare decision data
  const decisionCounts = items.reduce((acc, item) => {
    const decision = item.decision || 'Unknown';
    acc[decision] = (acc[decision] || 0) + 1;
    return acc;
  }, {});

  const decisionData = Object.entries(decisionCounts).map(([key, value]) => ({
    name: key,
    value: value,
    color: DECISION_COLORS[key] || '#9ca3af'
  }));

  // Prepare reworked data
  const reworkedCounts = items.reduce((acc, item) => {
    const reworked = item.reworked || 'No';
    acc[reworked] = (acc[reworked] || 0) + 1;
    return acc;
  }, {});

  const reworkedData = Object.entries(reworkedCounts).map(([key, value]) => ({
    name: key,
    value: value,
    color: REWORKED_COLORS[key] || '#9ca3af'
  }));

  // Prepare yield data (only Yes and No from decision field)
  const yieldCounts = items.reduce((acc, item) => {
    const decision = item.decision;
    if (decision === 'Yes' || decision === 'No') {
      acc[decision] = (acc[decision] || 0) + 1;
    }
    return acc;
  }, {});

  const yieldData = Object.entries(yieldCounts).map(([key, value]) => ({
    name: key,
    value: value,
    color: YIELD_COLORS[key] || '#9ca3af'
  }));

  // Prepare reworked success data (only records with Reworked = Yes, then their decision)
  const reworkedItems = items.filter(item => item.reworked === 'Yes');
  const reworkedSuccessCounts = reworkedItems.reduce((acc, item) => {
    const decision = item.decision;
    if (decision === 'Yes' || decision === 'No') {
      acc[decision] = (acc[decision] || 0) + 1;
    }
    return acc;
  }, {});

  const reworkedSuccessData = Object.entries(reworkedSuccessCounts).map(([key, value]) => ({
    name: key,
    value: value,
    color: REWORK_SUCCESS_COLORS[key] || '#9ca3af'
  }));

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

  // Prepare affected output data
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
    .sort((a, b) => b.count - a.count); // Sort by count descending

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
          No data available for charts
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Quality Control Analytics</h3>
      
      {/* Top Row - Yield and Reworked Success Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Yield Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Yield (Yes/No Only)</h4>
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
        </div>

        {/* Reworked Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Reworked Distribution</h4>
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

        {/* Affected Output Chart */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">Affected Output Distribution</h4>
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
              No affected output data available
            </div>
          )}
        </div>
      </div>
      
      {/* <div className="mt-6 text-sm text-gray-600 text-center">
        Total Records: {items.length} | Yield Records: {yieldData.reduce((sum, item) => sum + item.value, 0)} | Reworked Items: {reworkedItems.length}
      </div> */}
    </div>
  );
}

export default QualityControlChart;