import React, { useState, useEffect } from 'react';
import { getItems, createItem, updateItem } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../common/Header';
import DataTable from '../common/DataTable';
import QualityControlForm from './QualityControlForm';
import QualityControlChart from './QualityControlChart';

const REFRESH_INTERVAL_SECONDS = 5;

function QualityControlDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getItems();
      const qcData = data.filter(item => item.processType === 'QualityControl');
      setItems(qcData);
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
  };

  const toggleView = () => {
    setShowAnalytics(!showAnalytics);
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
      accessor: (item) => item.decision || 'N/A'
    },
    {
      header: 'Reworkability',
      accessor: (item) => item.reworkability || 'N/A'
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
      header: 'Affected Output',
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Toggle Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={toggleView}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-md"
          >
            {showAnalytics ? '📝 View Form' : '📊 View Analytics'}
          </button>
        </div>

        {!showAnalytics ? (
          /* Form View - Default (Only Form) */
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <QualityControlForm 
                onSubmit={handleSubmit} 
                loading={loading} 
                existingItems={items}
              />
            </div>
          </div>
        ) : (
          /* Analytics View */
          <div className="space-y-6">
            {/* Top Row - Status and Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Placeholder Container */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow p-4 h-32">
                  <h4 className="font-medium text-gray-700 mb-2">Additional Information</h4>
                  <div className="text-sm text-gray-500">
                    This section is reserved for future functionality and enhancements.
                  </div>
                </div>
              </div>

              {/* Status Info - Compact Top Right */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-4 h-32">
                  <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Records:</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="font-medium text-xs">{lastUpdate.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Refresh:</span>
                      <span className="font-medium flex items-center gap-1 text-xs">
                        {loading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                        )}
                        {REFRESH_INTERVAL_SECONDS}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <QualityControlChart items={items} />

            {/* Table Section */}
            <DataTable 
              items={items}
              columns={tableColumns}
              filename="quality_control_data"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default QualityControlDashboard;