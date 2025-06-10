import React, { useState } from 'react';
import './index.css'; // Tailwind
import './App.css';   // Custom global styles
import LoginPage from './components/LoginPage';
import SilveringDashboard from './components/silvering/SilveringDashboard';
import StreetingDashboard from './components/streeting/StreetingDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderDashboard = () => {
    if (!currentUser) return <LoginPage onLogin={handleLogin} />;

    switch (currentUser.department) {
      case 'silvering':
        return <SilveringDashboard user={currentUser} onLogout={handleLogout} />;
      case 'streeting':
        return <StreetingDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderDashboard()}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;