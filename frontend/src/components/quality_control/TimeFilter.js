import React from 'react';
import { filterItemsByTimeRange } from '../../utils/timeFiltering';

const TIME_FILTER_OPTIONS = [
  { value: 'hour', label: 'Last Hour', icon: '🕐' },
  { value: 'day', label: 'Last 24 Hours', icon: '📅' },
  { value: 'week', label: 'Last Week', icon: '📊' },
  { value: 'month', label: 'Last Month', icon: '📈' },
  { value: 'all', label: 'All Time', icon: '🗓️' }
];

function TimeFilter({ selectedFilter, onFilterChange, allItems = [] }) {
  // Calculate data counts for each filter to show availability
  const getDataCount = (filterValue) => {
    if (filterValue === 'all') return allItems.length;
    const filtered = filterItemsByTimeRange(allItems, filterValue);
    return filtered.length;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h4 className="font-medium text-gray-700 mb-3">Time Range Filter</h4>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {TIME_FILTER_OPTIONS.map(option => {
          const dataCount = getDataCount(option.value);
          const hasData = dataCount > 0;
          
          return (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 relative text-sm min-w-0 ${
                selectedFilter === option.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : hasData 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasData && option.value !== 'all'}
            >
              <span className="flex-shrink-0">{option.icon}</span>
              <span className="hidden sm:inline truncate">{option.label}</span>
              <span className="sm:hidden truncate">{option.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
      
      {/* Show active filter info */}
      <div className="mt-3 text-sm text-gray-600 break-words">
        {selectedFilter === 'hour' && `📋 Showing data from the last 60 minutes`}
        {selectedFilter === 'day' && `📋 Showing data from the last 24 hours`}
        {selectedFilter === 'week' && `📋 Showing data from the last 7 days`}
        {selectedFilter === 'month' && `📋 Showing data from the last 30 days`}
        {selectedFilter === 'all' && `📋 Showing all available data`}
      </div>
    </div>
  );
}

export default TimeFilter;
