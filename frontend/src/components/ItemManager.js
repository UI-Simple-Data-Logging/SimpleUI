import React, { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../utils/api';
import ItemForm from './ItemForm';
import ItemList from './ItemList';
import { toast } from 'react-toastify';

function ItemManager() {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ name: '', value: '', id: '' });
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getItems();
      setItems(data);
    } catch (err) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!currentItem.name.trim() || !currentItem.value.trim()) {
      toast.warn('Please enter both name and value');
      return;
    }

    try {
      setLoading(true);

      if (currentItem.id) {
        const updated = await updateItem(currentItem.id, {
          name: currentItem.name,
          value: currentItem.value,
        });
        toast.success('Item updated!');

        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === updated._id ? updated : item
          )
        );
      } else {
        const created = await createItem({
          name: currentItem.name,
          value: currentItem.value,
        });
        toast.success('Item added!');

        setItems((prevItems) => [...prevItems, created]);
      }

      setCurrentItem({ name: '', value: '', id: '' });
    } catch (err) {
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem({ name: item.name, value: item.value, id: item._id });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteItem(id);
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded shadow">
      <h1 className="text-2xl font-bold text-center mb-6">📋 Sensor Item Manager</h1>

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">Loading...</span>
        </div>
      )}

      <ItemForm
        item={currentItem}
        setItem={setCurrentItem}
        onSubmit={handleCreateOrUpdate}
        isEditing={!!currentItem.id}
      />
      <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default ItemManager;