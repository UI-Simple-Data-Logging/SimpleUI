/**
 * Test file for time filtering functionality
 * This can be run to verify the filtering logic works correctly
 */

const { filterItemsByTimeRange, getTimeRangeDescription, getFilteredItemsInfo } = require('./timeFiltering');

// Mock data for testing
const createMockItem = (hoursAgo) => ({
  _id: `item_${hoursAgo}`,
  processType: 'QualityControl',
  productId: `PROD_${hoursAgo}`,
  decision: Math.random() > 0.5 ? 'Yes' : 'No',
  timestamp: new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString(),
  operator: 'TestOperator'
});

// Create mock items with different timestamps
const mockItems = [
  createMockItem(0.5),  // 30 minutes ago
  createMockItem(2),    // 2 hours ago
  createMockItem(12),   // 12 hours ago
  createMockItem(48),   // 2 days ago
  createMockItem(120),  // 5 days ago
  createMockItem(240),  // 10 days ago
  createMockItem(720),  // 30 days ago
];

console.log('🧪 Testing Time Filtering Functionality\n');

// Test each filter
const filters = ['hour', 'day', 'week', 'month', 'all'];

filters.forEach(filter => {
  const filtered = filterItemsByTimeRange(mockItems, filter);
  const info = getFilteredItemsInfo(mockItems, filtered, filter);
  
  console.log(`📊 Filter: ${filter.toUpperCase()}`);
  console.log(`   Description: ${getTimeRangeDescription(filter)}`);
  console.log(`   Original items: ${mockItems.length}`);
  console.log(`   Filtered items: ${filtered.length}`);
  console.log(`   Percentage: ${info.percentage}%`);
  console.log(`   Items in range: ${filtered.map(item => 
    `${item.productId} (${Math.round((Date.now() - new Date(item.timestamp)) / (1000 * 60 * 60))}h ago)`
  ).join(', ')}`);
  console.log('');
});

console.log('✅ Time filtering tests completed!');

module.exports = {
  mockItems,
  createMockItem
};
