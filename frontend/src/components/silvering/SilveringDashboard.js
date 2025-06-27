import React, { useState, useEffect } from 'react';
import { getItems, createItem } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../common/Header';
import DataTable from '../common/DataTable';
import SilveringForm from './SilveringForm';
// import { PREDEFINED_CODES } from '../../utils/statusCodes';

const REFRESH_INTERVAL_SECONDS = 5;

function SilveringDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getItems();
      const silveringData = data.filter(item => item.processType === 'Silvering');
      setItems(silveringData);
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
    const payload = {
      processType: 'Silvering',
      squeegeeSpeed: {
        value: formData.squeegeeSpeed,
        unit: 'mm/s',
        deviceSource: formData.deviceSource
      },
      printPressure: {
        value: formData.printPressure,
        unit: 'N/m²',
        deviceSource: formData.deviceSource
      },
      inkViscosity: {
        value: formData.inkViscosity,
        unit: 'cP',
        deviceSource: formData.deviceSource
      },
      humidity: {
        value: formData.humidity,
        unit: '%',
        deviceSource: formData.deviceSource
      },
      priority: formData.priority,
      targetMetricAffected: formData.targetMetricAffected,
      operator: user.username,
      statusCode: '1100', // Silvering manual form
      reworked: false,
      decision: true,
      causeOfFailure: '',
      timestamp: new Date()
    };

    try {
      setLoading(true);
      console.log('📦 Submitting grouped payload:', payload);
      const result = await createItem(payload);
      setItems(prev => [result, ...prev]);
      toast.success('Silvering data submitted successfully!');
      setLastUpdate(new Date());
    } catch (err) {
      console.error('❌ Submission failed:', err);
      toast.error('Failed to submit silvering data');
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    { header: 'Squeegee Speed', accessor: (item) => item.squeegeeSpeed?.value + ' ' + item.squeegeeSpeed?.unit },
    { header: 'Print Pressure', accessor: (item) => item.printPressure?.value + ' ' + item.printPressure?.unit },
    { header: 'Ink Viscosity', accessor: (item) => item.inkViscosity?.value + ' ' + item.inkViscosity?.unit },
    { header: 'Humidity', accessor: (item) => item.humidity?.value + ' ' + item.humidity?.unit },
    { header: 'Device Source', accessor: (item) => item.squeegeeSpeed?.deviceSource || 'N/A' },
    { header: 'Priority', accessor: (item) => item.priority },
    { header: 'Metrics Affected', accessor: (item) => (item.targetMetricAffected || []).join(', ') },
    { header: 'Operator', accessor: (item) => item.operator || 'Unknown' },
    { header: 'Timestamp', accessor: (item) => new Date(item.timestamp).toLocaleString() }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        department="silvering" 
        username={user.username} 
        onLogout={onLogout} 
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <SilveringForm onSubmit={handleSubmit} loading={loading} />

            {/* Status Info */}
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <h4 className="font-medium text-gray-700 mb-2">Status</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Auto-refresh:</span>
                  <span className="font-medium flex items-center gap-1">
                    {loading && (
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                    )}
                    {REFRESH_INTERVAL_SECONDS}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2">
            <DataTable 
              items={items}
              columns={tableColumns}
              filename="silvering_data"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SilveringDashboard;