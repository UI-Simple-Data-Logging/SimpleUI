/**
 * Utility functions for filtering data by time ranges
 */

/**
 * Filter items based on the selected time range
 * @param {Array} items - Array of data items with timestamp property
 * @param {string} timeFilter - Time filter value ('hour', 'day', 'week', 'month', 'all')
 * @returns {Array} Filtered array of items
 */
export const filterItemsByTimeRange = (items, timeFilter) => {
  if (!items || items.length === 0 || timeFilter === 'all') {
    return items;
  }

  const now = new Date();
  let cutoffTime;

  switch (timeFilter) {
    case 'hour':
      cutoffTime = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hour ago
      break;
    case 'day':
      cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
      break;
    case 'week':
      cutoffTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
      break;
    case 'month':
      cutoffTime = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
      break;
    default:
      return items;
  }

  return items.filter(item => {
    if (!item.timestamp) return false;
    const itemTime = new Date(item.timestamp);
    return itemTime >= cutoffTime;
  });
};

/**
 * Get a human-readable description of the time range
 * @param {string} timeFilter - Time filter value
 * @returns {string} Description of the time range
 */
export const getTimeRangeDescription = (timeFilter) => {
  switch (timeFilter) {
    case 'hour':
      return 'Last Hour';
    case 'day':
      return 'Last 24 Hours';
    case 'week':
      return 'Last Week';
    case 'month':
      return 'Last Month';
    case 'all':
    default:
      return 'All Time';
  }
};

/**
 * Get the count of items for display purposes
 * @param {Array} originalItems - Original unfiltered items
 * @param {Array} filteredItems - Filtered items
 * @param {string} timeFilter - Current time filter
 * @returns {Object} Object with counts and filter info
 */
export const getFilteredItemsInfo = (originalItems, filteredItems, timeFilter) => {
  return {
    total: originalItems.length,
    filtered: filteredItems.length,
    timeRange: getTimeRangeDescription(timeFilter),
    isFiltered: timeFilter !== 'all',
    percentage: originalItems.length > 0 ? Math.round((filteredItems.length / originalItems.length) * 100) : 0
  };
};
