// src/components/ItemList.js
import React from 'react';

function ItemList({ items, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item._id} className="bg-gray-100 p-4 rounded shadow flex flex-col gap-2">
          <div className="text-lg font-semibold">
            {item.name}: <span className="text-gray-700">{item.value}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(item.timestamp).toLocaleString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ItemList;