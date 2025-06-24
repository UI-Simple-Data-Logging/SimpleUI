import React, { useState, useEffect } from 'react';
import { getItems, createItem } from '../../utils/api';
import { toast } from 'react-toastify';
import Header from '../common/Header';
import DataTable from '../common/DataTable';
import StreetingForm from './StreetingForm';
import StreetingChart from './StreetingChart';

const REFRESH_INTERVAL_SECONDS = 5;

function StreetingDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getItems();
      const streetingData = data.filter(item => item.processType === 'Streeting');
      setItems(streetingData);
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
    try {
      setLoading(true);

      const payload = {
        processType: 'Streeting',
        temperature: {
          value: parseFloat(formData.temperature),
          unit: '°C',
          deviceSource: 'thermometer'
        },
        speed: {
          value: parseFloat(formData.speed),
          unit: 'mm/s',
          deviceSource: 'encoder'
        },
        operator: user.username,
        statusCode: '2100', // Streeting manual form
        reworked: false,
        decision: true,
        causeOfFailure: '',
        timestamp: new Date()
      };

      const result = await createItem(payload);
      setItems(prev => [result, ...prev]);
      toast.success('Streeting data submitted successfully!');
      setLastUpdate(new Date());
    } catch (err) {
      toast.error('Failed to submit data');
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    {
      header: 'Temperature',
      accessor: (item) => item.temperature?.value + ' ' + item.temperature?.unit
    },
    {
      header: 'Speed',
      accessor: (item) => item.speed?.value + ' ' + item.speed?.unit
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
        department="streeting" 
        username={user.username} 
        onLogout={onLogout} 
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Form Section */}
          <div className="xl:col-span-1">
            <StreetingForm onSubmit={handleSubmit} loading={loading} />

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

          {/* Chart Section */}
          <div className="xl:col-span-3">
            <StreetingChart items={items} />
          </div>

          {/* Table Section - Full Width */}
          <div className="xl:col-span-4">
            <DataTable 
              items={items}
              columns={tableColumns}
              filename="streeting_data"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreetingDashboard;