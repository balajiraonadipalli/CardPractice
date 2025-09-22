import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogIn, UserPlus, User, Settings, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QuickNav = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-colorful p-4 border border-white/20">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Quick Navigation</h3>
        <div className="flex flex-col space-y-2">
          {/* Home - Always visible */}
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Home size={16} />
            <span className="text-sm">Home</span>
          </Link>

          {/* Destinations - Always visible */}
          <Link
            to="/destinations"
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
          >
            <MapPin size={16} />
            <span className="text-sm">Destinations</span>
          </Link>

          {isAuthenticated ? (
            // Show when user is logged in
            <>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <User size={16} />
                <span className="text-sm">Dashboard</span>
              </Link>
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                >
                  <Settings size={16} />
                  <span className="text-sm">Admin</span>
                </Link>
              )}
              
              {/* User info */}
              <div className="px-3 py-2 text-gray-600 text-xs border-t border-gray-200 mt-2 pt-2">
                Welcome, {user?.name}
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </>
          ) : (
            // Show when user is NOT logged in
            <>
              <Link
                to="/login"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <LogIn size={16} />
                <span className="text-sm">Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-2 px-3 py-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-all duration-200"
              >
                <UserPlus size={16} />
                <span className="text-sm">Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickNav;
