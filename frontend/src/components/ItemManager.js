// frontend/src/components/ItemManager.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/items'; // ✅ Relative path uses the proxy in package.json

function ItemManager() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editItem, setEditItem] = useState({ id: '', name: '' });

  const fetchItems = async () => {
    const res = await axios.get(API_URL);
    setItems(res.data);
  };

  const createItem = async () => {
    if (!newItem.trim()) return;
    await axios.post(API_URL, { name: newItem });
    setNewItem('');
    fetchItems();
  };

  const updateItem = async () => {
    if (!editItem.name.trim()) return;
    await axios.put(`${API_URL}/${editItem.id}`, { name: editItem.name });
    setEditItem({ id: '', name: '' });
    fetchItems();
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h2>Sensor Item Manager</h2>

      <input
        placeholder="New item name"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
      />
      <button onClick={createItem}>Add</button>

      {editItem.id && (
        <>
          <input
            value={editItem.name}
            onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
          />
          <button onClick={updateItem}>Update</button>
        </>
      )}

      <ul>
        {items.map((item) => (
          <li key={item._id}>
            {item.name}{' '}
            <button onClick={() => setEditItem({ id: item._id, name: item.name })}>Edit</button>
            <button onClick={() => deleteItem(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemManager;