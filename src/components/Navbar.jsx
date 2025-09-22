import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Debug authentication state
  console.log('🔍 Navbar - isAuthenticated:', isAuthenticated, 'user:', user?.name, 'isAdmin:', isAdmin);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-blue-200/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ✈️ TravelApp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium">
              Home
            </Link>
            <Link to="/destinations" className="text-gray-700 hover:text-green-600 transition-all duration-300 font-medium">
              Destinations
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium">
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-indigo-600 transition-all duration-300 font-medium">
                    Admin
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User size={20} />
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-all duration-300 font-medium bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="gradient-bg-primary text-white px-6 py-2 rounded-xl hover:shadow-colorful transition-all duration-300 font-medium hover-scale"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-purple-600 transition-all duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-md">
            <div className="py-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 hover:text-purple-600 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-purple-50 mx-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link
                to="/destinations"
                className="block text-gray-700 hover:text-green-600 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-green-50 mx-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Destinations
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-gray-700 hover:text-blue-600 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-blue-50 mx-2 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-gray-700 hover:text-indigo-600 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-indigo-50 mx-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4 mx-2">
                    <div className="flex items-center space-x-2 text-gray-700 mb-3 px-4">
                      <User size={18} />
                      <span className="font-medium">{user?.name}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-gray-700 hover:text-red-600 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-red-50 font-medium bg-red-50/50"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 mx-2">
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-blue-600 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-blue-50 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block gradient-bg-primary text-white px-6 py-3 rounded-xl hover:shadow-colorful transition-all duration-300 text-center font-medium hover-scale"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
