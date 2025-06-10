import React from 'react';

function Header({ department, username, onLogout }) {
  return (
    <div className="bg-white shadow-sm border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {department === 'silvering' ? 'Silvering Dashboard' : 'Streeting Dashboard'}
          </h1>
          <p className="text-gray-600">Welcome, {username}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;