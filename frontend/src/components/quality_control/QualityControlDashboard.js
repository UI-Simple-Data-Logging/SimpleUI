import React, { useState, useEffect, useMemo } from 'react';
import { getItems, createItem, updateItem } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../common/Header';
import DataTable from '../common/DataTable';
import QualityControlForm from './QualityControlForm';
import QualityControlChart from './QualityControlChart';
import LiveSensorChart from './LiveSensorChart';
import LatestSensorValues from './LatestSensorValues';
import LatestQualityMetrics from './LatestQualityMetrics';
import TimeFilter from './TimeFilter';
import FilteredDataSummary from './FilteredDataSummary';
import { filterItemsByTimeRange, getFilteredItemsInfo } from '../../utils/timeFiltering';

const REFRESH_INTERVAL_SECONDS = 5;

function QualityControlDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentView, setCurrentView] = useState('form'); // 'form', 'analytics', 'liveSensors'
  const [timeFilter, setTimeFilter] = useState('day'); // Default to last 24 hours

  // Memoize filtered items to avoid recalculating on every render
  const filteredItems = useMemo(() => {
    return filterItemsByTimeRange(items, timeFilter);
  }, [items, timeFilter]);

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
  };

  // Get filtered items info for display
  const filteredItemsInfo = useMemo(() => {
    return getFilteredItemsInfo(items, filteredItems, timeFilter);
  }, [items, filteredItems, timeFilter]);

  const fetchItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getItems();      // Get all items with sensor data (Silvering, Streeting, or QualityControl)
      const sensorData = data.filter(item => 
        item.processType === 'QualityControl' || 
        item.processType === 'Silvering' || 
        item.processType === 'Streeting'
      );
      setItems(sensorData);
      setLastUpdate(new Date());
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
    const interval = setInterval(() => {
      fetchItems(false);
    }, REFRESH_INTERVAL_SECONDS * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (formData) => {
    // Declare existingRecord outside the try block so it's accessible in catch
    let existingRecord = null;
    let isUpdate = false;

    try {
      setLoading(true);

      // Check if this is an update to an existing record
      existingRecord = items.find(item => 
        item.productId && item.productId.toLowerCase() === formData.productId.toLowerCase()
      );

      isUpdate = !!existingRecord;

      const payload = {
        processType: 'QualityControl',
        processStation: formData.processStation,
        productId: formData.productId,
        decision: formData.decision,
        reworkability: formData.reworkability,
        reworked: formData.reworked,
        causeOfFailure: formData.causeOfFailure,
        affectedOutput: formData.affectedOutput,
        operator: user.username,
        statusCode: '3100', // Quality Control manual form
        timestamp: new Date()
      };

      let result;
      if (existingRecord) {
        // Update existing record
        result = await updateItem(existingRecord._id, payload);
        setItems(prev => prev.map(item => 
          item._id === existingRecord._id ? result : item
        ));
        toast.success('Quality Control report updated successfully!');
      } else {
        // Create new record
        result = await createItem(payload);
        setItems(prev => [result, ...prev]);
        toast.success('Quality Control report submitted successfully!');
      }

      setLastUpdate(new Date());
    } catch (err) {
      toast.error(isUpdate ? 'Failed to update QC report' : 'Failed to submit QC report');
      console.error('QC submission error:', err);
    } finally {
      setLoading(false);
    }
  };  const toggleView = () => {
    // Toggle between current state (analytics/liveSensors) and form
    if (currentView === 'form') {
      setCurrentView('analytics'); // Return to analytics by default
    } else {
      setCurrentView('form');
    }
  };

  const switchToLiveSensors = () => {
    setCurrentView('liveSensors');
  };

  const switchToAnalytics = () => {
    setCurrentView('analytics');
  };

  const tableColumns = [
    {
      header: 'Process Station',
      accessor: (item) => item.processStation || 'N/A'
    },
    {
      header: 'Product ID',
      accessor: (item) => item.productId || 'N/A'
    },
    {
      header: 'Decision',
      accessor: (item) => {
        if (item.decision === 'Yes') return 'Pass';
        if (item.decision === 'No') return 'Fail';
        return item.decision || 'N/A';
      }
    },
    {
      header: 'Reworkability',
      accessor: (item) => {
        if (item.reworkability === 'Yes') return 'Reworkable';
        if (item.reworkability === 'No') return 'Not Reworkable';
        return item.reworkability || 'N/A';
      }
    },
    {
      header: 'Reworked',
      accessor: (item) => item.reworked || 'N/A'
    },
    {
      header: 'Cause of Failure',
      accessor: (item) => (item.causeOfFailure || []).join(', ') || 'None'
    },
    {
      header: 'Failure Classification',
      accessor: (item) => (item.affectedOutput || []).join(', ') || 'None'
    },
    {
      header: 'Operator',
      accessor: (item) => item.operator || 'Unknown'
    },
    {
      header: 'Timestamp',
      accessor: (item) => new Date(item.timestamp).toLocaleString()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        department="quality_control" 
        username={user.username} 
        onLogout={onLogout} 
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">        {/* Toggle Button */}
        <div className="mb-4 sm:mb-6 flex justify-center">          <button
            onClick={toggleView}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-md text-sm sm:text-base"
          >
            {currentView === 'form' ? '📊 View Analytics' : '📝 View Form'}
          </button>
        </div>

        {currentView === 'form' ? (
          /* Form View - Default (Only Form) */
          <div className="flex justify-center px-2 sm:px-0">
            <div className="w-full max-w-lg sm:max-w-md">
              <QualityControlForm 
                onSubmit={handleSubmit} 
                loading={loading} 
                existingItems={items}
              />
            </div>
          </div>        ) : currentView === 'analytics' ? (
          /* Analytics View */
          <div className="space-y-4 sm:space-y-6">
            {/* Time Filter */}
            <TimeFilter 
              selectedFilter={timeFilter}
              onFilterChange={handleTimeFilterChange}
              allItems={items}
            />

            {/* Filtered Data Summary */}
            <FilteredDataSummary 
              filteredItems={filteredItems}
              originalItems={items}
              timeFilter={timeFilter}
              processType="QualityControl"
            />

            {/* Top Row - Status and Placeholder */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Additional Information Container */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-lg shadow p-4 h-40">
                  <h4 className="font-medium text-gray-700 mb-2">Additional Information</h4>
                  <div className="text-sm text-gray-500">
                    Announcements will show up here.<br />
                    <b>Note: </b>All data is artificially injected.
                  </div>
                </div>
              </div>

              {/* Status Info - Compact Top Right */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 h-40 overflow-hidden">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Status</h4>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Records:</span>
                      <span className="font-medium text-right truncate ml-1">
                        {filteredItemsInfo.isFiltered 
                          ? `${filteredItemsInfo.filtered}/${filteredItemsInfo.total}` 
                          : filteredItemsInfo.total
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Range:</span>
                      <span className="font-medium text-xs text-right truncate ml-1">
                        {filteredItemsInfo.timeRange}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Updated:</span>
                      <span className="font-medium text-xs text-right truncate ml-1">{lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Refresh:</span>
                      <span className="font-medium flex items-center justify-end gap-1 text-xs ml-1">
                        {loading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 flex-shrink-0"></div>
                        )}
                        <span className="truncate">{REFRESH_INTERVAL_SECONDS}s</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Sensor Values */}
            <LatestSensorValues 
              items={filteredItems} 
              onNavigateToLiveSensors={switchToLiveSensors}
            />

            {/* Charts Section */}
            <QualityControlChart 
              items={filteredItems.filter(item => item.processType === 'QualityControl')}
              timeFilter={timeFilter}
              timeRange={filteredItemsInfo.timeRange}
            />

            {/* Table Section */}
            <DataTable 
              items={filteredItems.filter(item => item.processType === 'QualityControl')}
              columns={tableColumns}
              filename={`quality_control_data_${timeFilter !== 'all' ? timeFilter : 'all_time'}`}
            />
          </div>
        ) : (
          /* Live Sensors View */
          <div className="space-y-4 sm:space-y-6">
            {/* Time Filter */}
            <TimeFilter 
              selectedFilter={timeFilter}
              onFilterChange={handleTimeFilterChange}
              allItems={items}
            />

            {/* Filtered Data Summary */}
            <FilteredDataSummary 
              filteredItems={filteredItems}
              originalItems={items}
              timeFilter={timeFilter}
              processType="QualityControl"
            />

            {/* Top Row - Status and Placeholder */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Additional Information Container */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-lg shadow p-4 h-40">
                  <h4 className="font-medium text-gray-700 mb-2">Additional Information</h4>
                  <div className="text-sm text-gray-500">
                    Announcements will show up here.<br />
                    <b>Note: </b>All data is artificially injected.
                  </div>
                </div>
              </div>

              {/* Status Info - Compact Top Right */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 h-40 overflow-hidden">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Status</h4>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Records:</span>
                      <span className="font-medium text-right truncate ml-1">
                        {filteredItemsInfo.isFiltered 
                          ? `${filteredItemsInfo.filtered}/${filteredItemsInfo.total}` 
                          : filteredItemsInfo.total
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Range:</span>
                      <span className="font-medium text-xs text-right truncate ml-1">
                        {filteredItemsInfo.timeRange}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Updated:</span>
                      <span className="font-medium text-xs text-right truncate ml-1">{lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex-shrink-0">Refresh:</span>
                      <span className="font-medium flex items-center justify-end gap-1 text-xs ml-1">
                        {loading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 flex-shrink-0"></div>
                        )}
                        <span className="truncate">{REFRESH_INTERVAL_SECONDS}s</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Quality Metrics */}
            <LatestQualityMetrics 
              items={filteredItems.filter(item => item.processType === 'QualityControl')} 
              onViewAnalytics={switchToAnalytics}
              timeFilter={timeFilter}
            />

            {/* Live Sensor Chart Section */}
            <LiveSensorChart items={filteredItems} />
          </div>
        )}
      </div>
    </div>
  );
}

export default QualityControlDashboard;