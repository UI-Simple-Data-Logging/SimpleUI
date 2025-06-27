import React, { useMemo } from 'react';

function LatestQualityMetrics({ items, onViewAnalytics, timeFilter }) {
  // Calculate latest quality metrics
  const qualityMetrics = useMemo(() => {
    if (!items || items.length === 0) return null;

    // Use all filtered items (no limit, based on time filter)
    const recentItems = items
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate yield data (only Yes and No from decision field)
    const yieldCounts = recentItems.reduce((acc, item) => {
      const decision = item.decision;
      if (decision === 'Yes' || decision === 'No') {
        acc[decision] = (acc[decision] || 0) + 1;
      }
      return acc;
    }, {});

    const totalYield = Object.values(yieldCounts).reduce((sum, count) => sum + count, 0);
    const passRate = totalYield > 0 ? ((yieldCounts['Yes'] || 0) / totalYield * 100) : 0;

    // Calculate reworked success data
    const reworkedItems = recentItems.filter(item => item.reworked === 'Yes');
    const reworkedSuccessCounts = reworkedItems.reduce((acc, item) => {
      const outcome = item.reworkOutcome || item.decision;
      if (outcome === 'Yes' || outcome === 'No') {
        acc[outcome] = (acc[outcome] || 0) + 1;
      }
      return acc;
    }, {});

    const totalReworked = Object.values(reworkedSuccessCounts).reduce((sum, count) => sum + count, 0);
    const reworkSuccessRate = totalReworked > 0 ? ((reworkedSuccessCounts['Yes'] || 0) / totalReworked * 100) : 0;

    return {
      passRate: passRate.toFixed(1),
      totalYield,
      passCount: yieldCounts['Yes'] || 0,
      failCount: yieldCounts['No'] || 0,
      reworkSuccessRate: reworkSuccessRate.toFixed(1),
      totalReworked,
      reworkSuccessCount: reworkedSuccessCounts['Yes'] || 0,
      reworkFailCount: reworkedSuccessCounts['No'] || 0,
      lastUpdate: recentItems.length > 0 ? new Date(recentItems[0].timestamp) : new Date(),
      totalRecords: recentItems.length
    };
  }, [items]);

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Latest Quality Metrics</h4>
        <button
          onClick={onViewAnalytics}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          📊 View Analytics
        </button>
      </div>
      
      {qualityMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Yield Rate */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-700">Pass Rate (Yield)</h5>
              <span className={`text-2xl font-bold ${parseFloat(qualityMetrics.passRate) >= 80 ? 'text-green-600' : parseFloat(qualityMetrics.passRate) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {qualityMetrics.passRate}%
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Pass:</span>
                <span className="font-medium text-green-600">{qualityMetrics.passCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Fail:</span>
                <span className="font-medium text-red-600">{qualityMetrics.failCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{qualityMetrics.totalYield}</span>
              </div>
            </div>
          </div>

          {/* Rework Success Rate */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-700">Rework Success Rate</h5>
              <span className={`text-2xl font-bold ${parseFloat(qualityMetrics.reworkSuccessRate) >= 70 ? 'text-green-600' : parseFloat(qualityMetrics.reworkSuccessRate) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {qualityMetrics.reworkSuccessRate}%
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Success:</span>
                <span className="font-medium text-green-600">{qualityMetrics.reworkSuccessCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Scrap:</span>
                <span className="font-medium text-red-600">{qualityMetrics.reworkFailCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{qualityMetrics.totalReworked}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          No quality data available
        </div>
      )}
      
      {qualityMetrics && (
        <div className="text-xs text-gray-400 mt-2 text-center">
          Based on {qualityMetrics.totalRecords} records • Last updated: {qualityMetrics.lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default LatestQualityMetrics;
