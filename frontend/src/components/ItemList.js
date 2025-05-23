import React from 'react';

function ItemList({ items, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white rounded shadow text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                No items found
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.value}</td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ItemList;