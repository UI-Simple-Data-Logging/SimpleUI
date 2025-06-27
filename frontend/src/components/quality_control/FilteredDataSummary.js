import React from 'react';
import { getTimeRangeDescription } from '../../utils/timeFiltering';

function FilteredDataSummary({ filteredItems, originalItems, timeFilter, processType = 'QualityControl' }) {
  // Filter by process type
  const filteredQCItems = filteredItems.filter(item => item.processType === processType);
  const originalQCItems = originalItems.filter(item => item.processType === processType);
  
  if (filteredQCItems.length === 0) {
    return null;
  }

  // Calculate key metrics
  const totalRecords = filteredQCItems.length;
  const passCount = filteredQCItems.filter(item => item.decision === 'Yes').length;
  const failCount = filteredQCItems.filter(item => item.decision === 'No').length;
  const reworkCount = filteredQCItems.filter(item => item.decision === 'Goes to Rework').length;
  
  const yieldRate = totalRecords > 0 ? ((passCount / totalRecords) * 100).toFixed(1) : '0.0';
  const defectRate = totalRecords > 0 ? (((failCount + reworkCount) / totalRecords) * 100).toFixed(1) : '0.0';
  const reworkRate = totalRecords > 0 ? ((reworkCount / totalRecords) * 100).toFixed(1) : '0.0';
  
  // Get unique operators
  const operators = [...new Set(filteredQCItems.map(item => item.operator).filter(Boolean))];
  
  // Check if this is filtered data
  const isFiltered = timeFilter && timeFilter !== 'all';
  const timeRange = getTimeRangeDescription(timeFilter);
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <h4 className="text-md font-semibold text-gray-800 truncate">
          📈 Summary - {isFiltered ? timeRange : 'All Time'}
        </h4>
        {isFiltered && (
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded flex-shrink-0">
            {filteredQCItems.length} of {originalQCItems.length} records
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-green-600 truncate">{yieldRate}%</div>
          <div className="text-xs text-gray-600 font-medium">Yield Rate</div>
          <div className="text-xs text-gray-500">({passCount} passed)</div>
        </div>
        
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-red-600 truncate">{defectRate}%</div>
          <div className="text-xs text-gray-600 font-medium">Defect Rate</div>
          <div className="text-xs text-gray-500">({failCount + reworkCount} defects)</div>
        </div>
        
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600 truncate">{reworkRate}%</div>
          <div className="text-xs text-gray-600 font-medium">Rework Rate</div>
          <div className="text-xs text-gray-500">({reworkCount} reworked)</div>
        </div>
        
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{operators.length}</div>
          <div className="text-xs text-gray-600 font-medium">Operators</div>
          <div className="text-xs text-gray-500">Active in period</div>
        </div>
      </div>
      
      {isFiltered && (
        <div className="mt-3 text-xs text-gray-600 text-center break-words">
          📊 Metrics calculated from {timeRange.toLowerCase()} data only
        </div>
      )}
    </div>
  );
}

export default FilteredDataSummary;
