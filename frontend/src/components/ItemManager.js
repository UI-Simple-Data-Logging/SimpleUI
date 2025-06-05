import React, { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../utils/api';
import ItemForm from './ItemForm';
import ItemList from './ItemList';
import ButtonSensor from './ButtonSensor';
import Dashboard from './Dashboard';
import { toast } from 'react-toastify';

// Configuration constant - change this value to adjust refresh interval
const REFRESH_INTERVAL_SECONDS = 5;

function ItemManager() {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ 
    printPressure: '', 
    inkViscosity: '', 
    squeegeeSpeed: '', 
    id: '' 
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isDashboardView, setIsDashboardView] = useState(false);

  const fetchItems = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getItems();
      setItems(data);
      setLastUpdate(new Date());
    } catch (err) {
      toast.error('Failed to fetch items');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Auto-refresh effect with constant interval
  useEffect(() => {
    // Initial fetch
    fetchItems(true);

    // Set up interval for live reload
    const interval = setInterval(() => {
      fetchItems(false); // Don't show loading spinner for auto-refresh
    }, REFRESH_INTERVAL_SECONDS * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const validateInput = (value, fieldName) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      toast.warn(`${fieldName} must be a valid number greater than 0`);
      return false;
    }
    return true;
  };

  const handleCreateOrUpdate = async () => {
    // Validate all fields
    if (!currentItem.printPressure.trim() || !currentItem.inkViscosity.trim() || !currentItem.squeegeeSpeed.trim()) {
      toast.warn('All sensor fields are required');
      return;
    }

    // Validate each field is a positive number
    if (!validateInput(currentItem.printPressure, 'Print Pressure') ||
        !validateInput(currentItem.inkViscosity, 'Ink Viscosity') ||
        !validateInput(currentItem.squeegeeSpeed, 'Squeegee Speed')) {
      return;
    }

    try {
      setLoading(true);
      
      const sensorData = [
        { name: 'Print Pressure', value: parseFloat(currentItem.printPressure).toString() },
        { name: 'Ink Viscosity', value: parseFloat(currentItem.inkViscosity).toString() },
        { name: 'Squeegee Speed', value: parseFloat(currentItem.squeegeeSpeed).toString() }
      ];

      if (currentItem.id) {
        // Update existing items
        const updatePromises = sensorData.map(async (data) => {
          // Find existing item with this name
          const existingItem = items.find(item => 
            item.name === data.name && item._id !== currentItem.id
          );
          
          if (existingItem) {
            return await updateItem(existingItem._id, data);
          } else {
            // If no existing item found, create new one
            return await createItem(data);
          }
        });

        const results = await Promise.all(updatePromises);
        toast.success('Sensor data updated successfully!');

        // Update items state
        const updatedItems = [...items];
        results.forEach(result => {
          const index = updatedItems.findIndex(item => item._id === result._id);
          if (index !== -1) {
            updatedItems[index] = result;
          } else {
            updatedItems.push(result);
          }
        });
        setItems(updatedItems);
      } else {
        // Create new items - send 3 separate requests
        const createPromises = sensorData.map(data => createItem(data));
        const results = await Promise.all(createPromises);
        
        toast.success('All sensor data submitted successfully!');
        setItems(prevItems => [...prevItems, ...results]);
      }

      setCurrentItem({ printPressure: '', inkViscosity: '', squeegeeSpeed: '', id: '' });
      setLastUpdate(new Date()); // Update last update time after successful operation
    } catch (err) {
      toast.error('Failed to save sensor data');
      console.error('Error saving sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    // When editing, populate the form with existing sensor values
    const printPressureItem = items.find(i => i.name === 'Print Pressure');
    const inkViscosityItem = items.find(i => i.name === 'Ink Viscosity');
    const squeegeeSpeedItem = items.find(i => i.name === 'Squeegee Speed');

    setCurrentItem({ 
      printPressure: printPressureItem ? printPressureItem.value : '',
      inkViscosity: inkViscosityItem ? inkViscosityItem.value : '',
      squeegeeSpeed: squeegeeSpeedItem ? squeegeeSpeedItem.value : '',
      id: 'editing'
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteItem(id);
      toast.success('Item deleted');
      fetchItems(false);
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchItems(true);
    toast.info('Data refreshed manually');
  };

  const toggleDashboardView = () => {
    setIsDashboardView(!isDashboardView);
  };

  return (
    <div className={`max-w-7xl mx-auto mt-10 p-6 bg-gray-50 rounded shadow ${isDashboardView ? 'max-w-full' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isDashboardView ? '📊 Dashboard View' : '📋 Sensor Data Manager'}
        </h1>
        
        {/* Controls */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={toggleDashboardView}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isDashboardView 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isDashboardView ? '📋 Show All' : '📊 Dashboard'}
          </button>
          
          {!isDashboardView && (
            <>
              <button
                onClick={handleManualRefresh}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                🔄 Refresh
              </button>
              
              <div className="text-gray-500 flex items-center gap-2">
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                )}
                <span>Auto-refresh: {REFRESH_INTERVAL_SECONDS}s</span>
                <span>•</span>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && !isDashboardView && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">Loading...</span>
        </div>
      )}

      {isDashboardView ? (
        /* Dashboard View - Full width analytics */
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Button Analytics - Takes full width on mobile, half on xl screens */}
            <div className="xl:col-span-2">
              <ButtonSensor items={items} />
            </div>
            
            {/* Dashboard Charts - Full width */}
            <div className="xl:col-span-2">
              <Dashboard items={items} />
            </div>
          </div>
          
          {/* Additional dashboard info */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Live Dashboard • Auto-refresh: {REFRESH_INTERVAL_SECONDS}s</span>
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Normal View - Original layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - ItemForm and ItemList */}
          <div className="space-y-6">
            <ItemForm
              item={currentItem}
              setItem={setCurrentItem}
              onSubmit={handleCreateOrUpdate}
              isEditing={!!currentItem.id}
            />
            
            <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
          
          {/* Right side - ButtonSensor and Dashboard */}
          <div className="space-y-6">
            <ButtonSensor items={items} />
            <Dashboard items={items} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemManager;