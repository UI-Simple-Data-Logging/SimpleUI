// src/components/ItemManager.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItemForm from './ItemForm';
import ItemList from './ItemList';

const API_URL = '/api/items';

function ItemManager() {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ name: '', value: '', id: '' });

  const fetchItems = async () => {
    const res = await axios.get(API_URL);
    setItems(res.data);
  };

  const handleCreateOrUpdate = async () => {
    if (!currentItem.name.trim() || !currentItem.value.trim()) return;

    if (currentItem.id) {
      await axios.put(`${API_URL}/${currentItem.id}`, {
        name: currentItem.name,
        value: currentItem.value,
      });
    } else {
      await axios.post(API_URL, {
        name: currentItem.name,
        value: currentItem.value,
      });
    }

    setCurrentItem({ name: '', value: '', id: '' });
    fetchItems();
  };

  const handleEdit = (item) => {
    setCurrentItem({ name: item.name, value: item.value, id: item._id });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded shadow">
      <h1 className="text-2xl font-bold text-center mb-6">📋 Sensor Item Manager</h1>
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