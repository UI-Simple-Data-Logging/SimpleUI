// src/components/ItemForm.js
import React from 'react';

function ItemForm({ item, setItem, onSubmit, isEditing }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Item name"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          className="flex-1 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Value"
          value={item.value}
          onChange={(e) => setItem({ ...item, value: e.target.value })}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={onSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {isEditing ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  );
}

export default ItemForm;